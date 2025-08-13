import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor";
import type { LiteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html";
import { TeX } from "mathjax-full/js/input/tex";
import { mathjax } from "mathjax-full/js/mathjax";
import { SVG } from "mathjax-full/js/output/svg";


// Following mathjax direct pattern: https://github.com/mathjax/MathJax-demos-node/blob/master/direct/tex2svg

type MathJaxContext = {
  adaptor: LiteAdaptor;
  document: ReturnType<typeof mathjax.document>;
};

function createMathJaxInitializer(): () => MathJaxContext {
  let context: MathJaxContext | null = null;

  return function getMathJaxContext(): MathJaxContext {
    if (!context) {
      const adaptor = liteAdaptor();
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

      const document = mathjax.document("", { InputJax: tex, OutputJax: svg });

      context = { adaptor, document };
    }

    return context;
  };
}

const getMathJaxContext = createMathJaxInitializer();

export function latexToSvg(latex: string, isDisplay = false): string {
  const { adaptor, document } = getMathJaxContext();
  const node = document.convert(latex, { display: isDisplay });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return adaptor.innerHTML(node);
}
