import isElectron from "is-electron";

export function getParentNode(ele, cb) {
    if (!ele) return null;

    while (!cb(ele) && ele.parentNode && ele !== document.body) {
        ele = ele.parentNode;
    }
    return ele;
}

export function getElementDimensions(domElement) {
    const calculatedStyle = window.getComputedStyle(domElement);
    const Rect = domElement.getBoundingClientRect();

    return {
        borderLeftWidth: `${parseInt(calculatedStyle.borderLeftWidth, 10)}px`,
        borderRightWidth: `${parseInt(calculatedStyle.borderRightWidth, 10)}px`,
        borderTopWidth: `${parseInt(calculatedStyle.borderTopWidth, 10)}px`,
        borderBottomWidth: `${parseInt(
            calculatedStyle.borderBottomWidth,
            10
        )}px`,
        marginLeft: `${parseInt(calculatedStyle.marginLeft, 10)}px`,
        marginRight: `${parseInt(calculatedStyle.marginRight, 10)}px`,
        marginTop: `${parseInt(calculatedStyle.marginTop, 10)}px`,
        marginBottom: `${parseInt(calculatedStyle.marginBottom, 10)}px`,
        paddingLeft: `${parseInt(calculatedStyle.paddingLeft, 10)}px`,
        paddingRight: `${parseInt(calculatedStyle.paddingRight, 10)}px`,
        paddingTop: `${parseInt(calculatedStyle.paddingTop, 10)}px`,
        paddingBottom: `${parseInt(calculatedStyle.paddingBottom, 10)}px`,
        left: `${
            Rect.left +
            window.scrollX -
            parseInt(calculatedStyle.marginLeft, 10)
        }px`,
        top: `${
            Rect.top + window.scrollY - parseInt(calculatedStyle.marginTop, 10)
        }px`,
        width: `${
            Rect.width +
            parseInt(calculatedStyle.marginLeft, 10) +
            parseInt(calculatedStyle.marginRight, 10)
        }px`,
        height: `${
            Rect.height +
            parseInt(calculatedStyle.marginTop, 10) +
            parseInt(calculatedStyle.marginBottom, 10)
        }px`,
    };
}

// export const Editors = {
//     sublime: "subl://open?url=file://{path}&line={line}&column={column}",
//     textmate: "txmt://open?url=file://{path}&line={line}&column={column}",
//     emacs: "emacs://open?url=file://{path}&line={line}&column={column}",
//     macvim: "mvim://open/?url=file://{path}&line={line}&column={column}",
//     phpstorm: "phpstorm://open?file={path}&line={line}&column={column}",
//     webstorm: "webstorm://open?file={path}&line={line}&column={column}",
//     idea: "idea://open?file={path}&line={line}&column={column}",
//     vscode: "vscode://file/{path}:{line}:{column}",
//     "vscode-insiders": "vscode-insiders://file/{path}:{line}:{column}",
//     atom: "atom://core/open/file?filename={path}&line={line}&column={column}",
// };

export function launchEditor({ editor, path, line, column }) {
    const baseUrl = "/__launch__?file={path}:{line}:{column}";
    const url = baseUrl.replace(/{(.*?)}/g, (_, mark) => {
        return mark === "path" ? path : mark === "line" ? line : column;
    });

    if (isElectron()) {
        require("electron").shell.openExternal(url);
    } else {
        window.open(url);
    }
}
