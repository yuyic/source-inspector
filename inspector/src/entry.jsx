import ReactDOM from "react-dom";
import { App } from "./app";

const config = {
    hotKey: 18,
    dataKey: "data-open-in-editor",
    ...window.__open_in_editor__,
};

ReactDOM.render(
    <App config={config} />,
    document.getElementById("__open-in-editor__")
);
