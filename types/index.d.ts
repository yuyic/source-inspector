export const webpack: typeof import("./webpack");
export const vite: (options?: {
    hotKey?: string | undefined;
    editor?: string | undefined;
} | undefined) => {
    name: string;
    enforce: string;
    config(config: any): any;
    transform(code: any, id: any): any;
    transformIndexHtml(html: any): any;
};
export const inspector: typeof import("./inspector");
export const ast: typeof import("./ast");
