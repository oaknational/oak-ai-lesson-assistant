import { LessonPlanKeys } from "@oakai/aila/src/protocol/schema";

export const organiseSections: {
  trigger: LessonPlanKeys;
  dependants: LessonPlanKeys[];
}[] = [
  {
    trigger: "learningOutcome",
    dependants: ["learningOutcome", "learningCycles"],
  },
  {
    trigger: "priorKnowledge",
    dependants: [
      "priorKnowledge",
      "keyLearningPoints",
      "misconceptions",
      "keywords",
    ],
  },
  {
    trigger: "starterQuiz",
    dependants: ["starterQuiz", "cycle1", "cycle2", "cycle3", "exitQuiz"],
  },
  { trigger: "additionalMaterials", dependants: ["additionalMaterials"] },
];
