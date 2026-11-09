import { cva } from "class-variance-authority";

import BoxBorderBottom from "../Border/BoxBorder/BoxBorderBottom";
import BoxBorderLeft from "../Border/BoxBorder/BoxBorderLeft";
import BoxBorderRight from "../Border/BoxBorder/BoxBorderRight";
import BoxBorderTop from "../Border/BoxBorder/BoxBorderTop";

const boxEdgeBottom = cva("absolute w-full", {
  variants: {
    inputType: {
      textarea: "right-0 bottom-4 left-0",
      text: "right-0 bottom-0 left-0",
      dropdown: "right-0 bottom-0 left-0",
      email: "right-0 bottom-0 left-0",
    },
  },
});

const boxEdgeLeft = cva("absolute top-0 bottom-0 left-0", {
  variants: {
    inputType: {
      textarea: "h-[93%]",
      text: "h-full",
      dropdown: "h-full",
      email: "h-full",
    },
  },
});

const boxEdgeRight = cva("absolute right-0 bottom-0 h-[90%]", {
  variants: {
    inputType: {
      textarea: "bottom-4",
      text: "bottom-0",
      dropdown: "bottom-0",
      email: "bottom-0",
    },
  },
});

type BoxEdgesProps = {
  inputType: "text" | "textarea" | "dropdown" | "email";
};

const BoxEdges = ({ inputType }: Readonly<BoxEdgesProps>) => {
  return (
    <>
      <BoxBorderLeft className={boxEdgeLeft({ inputType })} />
      <BoxBorderRight className={boxEdgeRight({ inputType })} />
      <BoxBorderTop className="absolute top-0 right-0 left-0 w-full" />
      <BoxBorderBottom className={boxEdgeBottom({ inputType })} />
    </>
  );
};

export default BoxEdges;
