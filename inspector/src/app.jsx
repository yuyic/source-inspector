import { useCallback, useEffect, useRef } from "react";
import { Layer } from "./layer";
import useKeyPress from "./useKeyPress";
import { getElementDimensions, getParentNode, launchEditor } from "./utils";
import less from "./styles.module.less";

const map = new WeakMap();
let prevDom;

function collectElementsData(dataKey) {
    document.querySelectorAll(`[${dataKey}]`).forEach((element) => {
        const attribute = element.getAttribute(dataKey);
        if (attribute) {
            map.set(element, attribute);
        }
        element.removeAttribute(dataKey);
    });
}

const wrapper = document.getElementById("__open-in-editor__");
export const App = ({ config }) => {
    const active = useKeyPress(config.hotKey);
    const layerRef = useRef();

    useEffect(() => {
        const observer = new MutationObserver(() =>
            collectElementsData(config.dataKey)
        );
        observer.observe(document.body, {
            attributes: false,
            childList: true,
            subtree: true,
        });
        collectElementsData(config.dataKey);

        return () => observer.disconnect();
    }, [config]);

    const onClick = useCallback(
        function onClick(e) {
            e.stopPropagation();
            e.preventDefault();
            try {
                const target = getParentNode(e.target, (ele) => !!map.get(ele));
                const data = map.get(target);
                if (data) {
                    const [absolutePath] = data.split("|");
                    const [path, line, column] = absolutePath.split(":");
                    launchEditor({
                        path,
                        line,
                        column,
                        editor: config.editor,
                    });
                }
            } catch (err) {
                console.log(err);
            }
        },
        [config]
    );

    const onMouseMove = useCallback(function onMouseMove(e) {
        requestAnimationFrame(() => {
            e.stopPropagation();
            const target = getParentNode(e.target, (ele) => !!map.get(ele));
            const data = map.get(target);
            if (data && target && layerRef.current && prevDom !== target) {
                const dimensions = getElementDimensions(target);
                const [, replatePath, componentName, frame] = data.split("|");

                layerRef.current.update(dimensions, {
                    frame,
                    componentName,
                    domType: target.nodeName.toLowerCase(),
                    srcPath: replatePath,
                });
            }
            prevDom = target;
        });
    }, []);

    useEffect(() => {
        if (active) {
            wrapper.setAttribute("style", "border-color: rgba(10,50,180,0.4);");
            document.addEventListener("mousemove", onMouseMove, false);
            document.addEventListener("click", onClick, true);
        } else {
            wrapper.removeAttribute("style");
            document.removeEventListener("mousemove", onMouseMove, false);
            document.removeEventListener("click", onClick, true);
        }
    }, [active, onMouseMove, onClick]);

    return (
        <React.Fragment>
            <Layer ref={layerRef} active={active} />
            <div
                className={less.frame}
                style={{
                    borderColor: active ? "blueviolet" : "rgba(0,0,0,0)",
                }}
            ></div>
        </React.Fragment>
    );
};
