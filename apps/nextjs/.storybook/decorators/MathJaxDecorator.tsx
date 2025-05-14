import React from "react";

import { Decorator } from "@storybook/react";
import { MathJaxContext } from "better-react-mathjax";

export const MathJaxDecorator: Decorator = (Story) => (
  <MathJaxContext>
    <Story />
  </MathJaxContext>
);
