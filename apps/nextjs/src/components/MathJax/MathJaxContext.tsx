"use client";

import React from "react";

import { type MathJax3Config, MathJaxContext } from "better-react-mathjax";

const mathJaxConfig: MathJax3Config = {
  tex: {
    inlineMath: [
      ["\\(", "\\)"],
      // Configure $$ as inline math because our quiz data contains equations formatted as display tex
      ["$$", "$$"],
    ],
    displayMath: [
      // Remove $$ from displayMath to prevent conflicts with inlineMath
      ["\\[", "\\]"],
    ],
    // Ensure that celsius symbol is properly rendered, as per PUPIL-807
    packages: { "[+]": ["unicode"] },
  },
  loader: { load: ["[tex]/unicode"] },
};

export const OakMathJaxContext = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <MathJaxContext config={mathJaxConfig}>{children}</MathJaxContext>;
};
