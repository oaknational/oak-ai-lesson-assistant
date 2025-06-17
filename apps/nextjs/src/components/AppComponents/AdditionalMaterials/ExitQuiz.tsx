import React from "react";

import type { ExitQuiz as ExitQuizType } from "@oakai/additional-materials/src/documents/additionalMaterials/exitQuiz/schema";

import { Quiz } from "./Quiz";

type ExitQuizProps = {
  generation: ExitQuizType;
};

export const ExitQuiz = ({ generation }: ExitQuizProps) => {
  return <Quiz generation={generation} />;
};
