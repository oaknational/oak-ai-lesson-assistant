import React from "react";

import { Decorator } from "@storybook/nextjs";

import { OakMathJaxContext } from "../../src/components/MathJax/MathJaxContext";

export const MathJaxDecorator: Decorator = (Story) => (
  <OakMathJaxContext>
    <Story />
  </OakMathJaxContext>
);
