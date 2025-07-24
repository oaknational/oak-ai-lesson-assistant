declare module "mathjax" {
  export interface MathJaxConfig {
    loader?: {
      load?: string[];
    };
    tex?: {
      inlineMath?: [string, string][];
      displayMath?: [string, string][];
    };
    svg?: {
      fontCache?: "local" | "global" | "none";
      scale?: number;
    };
  }

  export interface MathJaxObject {
    tex2svg: (latex: string, options?: { display?: boolean }) => unknown;
    startup: {
      adaptor: {
        outerHTML: (node: unknown) => string;
      };
    };
  }

  export function init(config: MathJaxConfig): Promise<MathJaxObject>;
}
