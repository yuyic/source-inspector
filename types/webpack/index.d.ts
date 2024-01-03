export = OpenInEditorPlugin;
declare class OpenInEditorPlugin {
    /**
     * @param {Object} [options]
     * @param {string|number} [options.hotKey]
     */
    constructor(options?: {
        hotKey?: string | number | undefined;
    } | undefined);
    options: {
        hotKey: string | number;
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
