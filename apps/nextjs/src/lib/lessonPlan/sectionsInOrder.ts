import {
  allSectionsInOrder,
  type LessonPlanKey,
} from "@oakai/aila/src/protocol/schema";

export { allSectionsInOrder };

export const groupedSectionsInOrder: LessonPlanKey[][] = [
  ["learningOutcome", "learningCycles"],
  ["priorKnowledge", "keyLearningPoints", "misconceptions", "keywords"],
  ["starterQuiz", "cycle1", "cycle2", "cycle3", "exitQuiz"],
  ["additionalMaterials"],
];
