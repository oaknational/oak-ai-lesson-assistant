import React from "react";

import type { StarterQuiz as StarterQuizType } from "@oakai/additional-materials/src/documents/additionalMaterials/starterQuiz/schema";

import { Quiz } from "./Quiz";

type StarterQuizProps = {
  generation: StarterQuizType;
};

export const StarterQuiz = ({ generation }: StarterQuizProps) => {
  return <Quiz generation={generation} />;
};
