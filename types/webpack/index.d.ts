export = OpenInEditorPlugin;
declare class OpenInEditorPlugin {
    /**
     * @param {Object} [options]
     * @param {string|number} [options.hotKey]
     * @param {string} [options.editor]
     */
    constructor(options?: {
        hotKey?: string | number | undefined;
        editor?: string | undefined;
    } | undefined);
    options: {
        hotKey: string | number;
        editor: string;
        port: number;
        dataKey: string;
    };
    /**
     *
     * @param {import("webpack").Compiler} compiler
     * @returns
     */
    apply(compiler: import("webpack").Compiler): void;
}
