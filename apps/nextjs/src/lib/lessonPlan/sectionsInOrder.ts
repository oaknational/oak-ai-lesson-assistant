import type { LessonPlanKey } from "@oakai/aila/src/protocol/schema";

export const allSectionsInOrder: LessonPlanKey[] = [
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

export const groupedSectionsInOrder: LessonPlanKey[][] = [
  ["learningOutcome", "learningCycles"],
  ["priorKnowledge", "keyLearningPoints", "misconceptions", "keywords"],
  ["starterQuiz", "cycle1", "cycle2", "cycle3", "exitQuiz"],
  ["additionalMaterials"],
];
