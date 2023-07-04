declare function _exports(options?: {
    hotKey?: string | undefined;
    editor?: string | undefined;
} | undefined): {
    name: string;
    enforce: string;
    config(config: any): any;
    transform(code: any, id: any): any;
    transformIndexHtml(html: any): any;
};
export = _exports;