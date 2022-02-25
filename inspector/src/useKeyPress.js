import { useState, useEffect } from "react";

export const isInputDOMNode = (e) => {
    const target = e?.target;

    return (
        ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target?.nodeName) ||
        target?.hasAttribute("contenteditable")
    );
};

export default function useKeyPress(keyCode) {
    const [keyPressed, setKeyPressed] = useState(false);

    useEffect(() => {
        if (typeof keyCode !== "undefined") {
            const downHandler = (event) => {
                if (
                    !isInputDOMNode(event) &&
                    (event.key === keyCode || event.keyCode === keyCode)
                ) {
                    event.preventDefault();

                    setKeyPressed(true);
                }
            };

            const upHandler = (event) => {
                if (
                    !isInputDOMNode(event) &&
                    (event.key === keyCode || event.keyCode === keyCode)
                ) {
                    setKeyPressed(false);
                }
            };

            const resetHandler = () => setKeyPressed(false);

            window.addEventListener("keydown", downHandler);
            window.addEventListener("keyup", upHandler);
            window.addEventListener("blur", resetHandler);

            return () => {
                window.removeEventListener("keydown", downHandler);
                window.removeEventListener("keyup", upHandler);
                window.removeEventListener("blur", resetHandler);
            };
        }
    }, [keyCode, setKeyPressed]);

    return keyPressed;
}
