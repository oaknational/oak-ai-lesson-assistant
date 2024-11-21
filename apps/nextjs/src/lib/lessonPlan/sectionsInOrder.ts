import type { LessonPlanKeys } from "@oakai/aila/src/protocol/schema";

export const allSectionsInOrder: LessonPlanKeys[] = [
  "learningOutcome",
  "learningCycles",
  "priorKnowledge",
  "keyLearningPoints",
  "misconceptions",
  "keywords",
  "starterQuiz",
  "cycle1",
  "cycle2",
  "cycle3",
  "exitQuiz",
  "additionalMaterials",
];

export const groupedSectionsInOrder: LessonPlanKeys[][] = [
  ["learningOutcome", "learningCycles"],
  ["priorKnowledge", "keyLearningPoints", "misconceptions", "keywords"],
  ["starterQuiz", "cycle1", "cycle2", "cycle3", "exitQuiz"],
  ["additionalMaterials"],
];
