import { useImperativeHandle, useState, forwardRef } from "react";
import less from "./styles.module.less";

const Title = (props) => {
    const color = props.frame === "react" ? "black" : "gray";

    return (
        <div className={less.title}>
            {/^[A-Z]/.test(props.title) ? (
                <span
                    style={{
                        display: "inline-block",
                        color: "#fff",
                        borderRadius: 2,
                        background: color,
                        padding: "0 4px",
                    }}
                >
                    {props.title}
                </span>
            ) : (
                props.domType
            )}
        </div>
    );
};

const Detail = (props) => {
    return (
        <div className={less.detail} style={props.style}>
            <span className={less.left}>
                <Title {...props} />
                <div className={less.subTitle}>{props.srcPath}</div>
            </span>
            <span className={less.right} />
        </div>
    );
};

export const Layer = forwardRef(({ active }, ref) => {
    const [style, setStyle] = useState({});
    const [data, setData] = useState({});
    useImperativeHandle(ref, () => {
        return {
            update(inspect, detail) {
                const {
                    left,
                    top,

                    marginLeft,
                    marginRight,
                    marginTop,
                    marginBottom,

                    borderLeftWidth,
                    borderRightWidth,
                    borderTopWidth,
                    borderBottomWidth,

                    paddingLeft,
                    paddingRight,
                    paddingTop,
                    paddingBottom,

                    width,
                    height,
                } = inspect;

                setData(detail);

                setStyle({
                    detail: {
                        left,
                        top: `${
                            parseInt(top, 10) + parseInt(height, 10) + 10
                        }px`,
                    },
                    margin: {
                        left,
                        top,
                        borderLeftWidth: marginLeft,
                        borderRightWidth: marginRight,
                        borderTopWidth: marginTop,
                        borderBottomWidth: marginBottom,
                        width,
                        height,
                    },
                    border: {
                        borderLeftWidth: borderLeftWidth,
                        borderRightWidth: borderRightWidth,
                        borderTopWidth: borderTopWidth,
                        borderBottomWidth: borderBottomWidth,
                    },
                    padding: {
                        borderLeftWidth: paddingLeft,
                        borderRightWidth: paddingRight,
                        borderTopWidth: paddingTop,
                        borderBottomWidth: paddingBottom,
                    },
                });
            },
        };
    });

    if (!active) return null;

    return (
        <div className={less.layer}>
            <div className={less.margin} style={style.margin}>
                <div className={less.border} style={style.border}>
                    <div className={less.padding} style={style.padding}>
                        <div className={less.content} style={style.content} />
                    </div>
                </div>
            </div>
            <Detail style={style.detail} {...data} />
        </div>
    );
});
