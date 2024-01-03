export const webpack: typeof import("./webpack");
export const vite: (options?: {
    hotKey?: string | undefined;
    editor?: string | undefined;
} | undefined) => {
    name: string;
    enforce: string;
    config(config: any): any;
    configureServer(server: any): void;
    transform(code: any, id: any): any;
    transformIndexHtml(html: any): any;
};
export const inspector: typeof import("./inspector");
export const ast: typeof import("./ast");
export const middleware: (req: any, res: any, next: any) => void;
