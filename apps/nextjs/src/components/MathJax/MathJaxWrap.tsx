"use client";

import React from "react";

import { MathJax } from "better-react-mathjax";

const MathJaxWrap = ({ children }: { children: React.ReactNode }) => {
  return (
    <MathJax hideUntilTypeset="every" dynamic>
      {children}
    </MathJax>
  );
};

export { MathJaxWrap };
