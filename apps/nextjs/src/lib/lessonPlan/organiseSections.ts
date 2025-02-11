import type { LessonPlanKey } from "@oakai/aila/src/protocol/schema";

// NOTE: This is currently unused.
// If it's still not required after switching to the lesson plan store, please remove it
export const organiseSections: {
  trigger: LessonPlanKey;
  dependants: LessonPlanKey[];
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
