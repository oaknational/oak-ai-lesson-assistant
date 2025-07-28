import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor";
import type { LiteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html";
import { TeX } from "mathjax-full/js/input/tex";
import { mathjax } from "mathjax-full/js/mathjax";
import { SVG } from "mathjax-full/js/output/svg";

let adaptor: LiteAdaptor | null = null;
let document: ReturnType<typeof mathjax.document> | null = null;

function ensureInitialized() {
  if (adaptor && document) {
    return;
  }

  adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);

  const tex = new TeX({
    packages: [
      "base",
      "ams",
      "noundefined",
      "newcommand",
      "boldsymbol",
      "unicode",
    ],
  });

  const svg = new SVG({
    fontCache: "local",
  });

  document = mathjax.document("", { InputJax: tex, OutputJax: svg });
}

/**
 * Convert LaTeX string to SVG using MathJax
 * @param latex - The LaTeX string to convert
 * @param isDisplay - Whether to render as display math (centered, larger) or inline
 * @returns SVG string
 */
export function latexToSvg(latex: string, isDisplay = false): string {
  ensureInitialized();
  const node = document!.convert(latex, { display: isDisplay });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return adaptor!.innerHTML(node);
}
