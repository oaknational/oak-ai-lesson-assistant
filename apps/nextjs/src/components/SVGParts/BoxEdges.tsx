import { cva } from "class-variance-authority";

import BoxBorderBottom from "../Border/BoxBorder/BoxBorderBottom";
import BoxBorderLeft from "../Border/BoxBorder/BoxBorderLeft";
import BoxBorderRight from "../Border/BoxBorder/BoxBorderRight";
import BoxBorderTop from "../Border/BoxBorder/BoxBorderTop";

const boxEdgeBottom = cva("absolute w-[100%]", {
  variants: {
    inputType: {
      textarea: "bottom-4 left-0 right-0",
      text: " bottom-0 left-0 right-0",
      dropdown: " bottom-0 left-0 right-0",
      email: " bottom-0 left-0 right-0",
    },
  },
});

const boxEdgeLeft = cva("absolute bottom-0 left-0 top-0 ", {
  variants: {
    inputType: {
      textarea: "h-[93%]",
      text: "h-[100%]",
      dropdown: "h-[100%]",
      email: "h-[100%]",
    },
  },
});

const boxEdgeRight = cva("absolute  bottom-0 right-0 h-[90%]", {
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
      <BoxBorderTop className="absolute left-0 right-0 top-0 w-[100%]" />
      <BoxBorderBottom className={boxEdgeBottom({ inputType })} />
    </>
  );
};

export default BoxEdges;
