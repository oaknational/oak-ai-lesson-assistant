import { z } from "zod";

import type { LessonPlanKey } from "../../protocol/schema";

export const sectionKeysSchema = z.union([
  z.literal("title"),
  z.literal("keyStage"),
  z.literal("subject"),
  z.literal("topic"),
  z.literal("basedOn"),
  z.literal("learningOutcome"),
  z.literal("learningCycles"),
  z.literal("priorKnowledge"),
  z.literal("keyLearningPoints"),
  z.literal("misconceptions"),
  z.literal("keywords"),
  z.literal("starterQuiz"),
  z.literal("cycle1"),
  z.literal("cycle2"),
  z.literal("cycle3"),
  z.literal("exitQuiz"),
  z.literal("additionalMaterials"),
]);

type SectionGroups = LessonPlanKey[][];

export const sectionGroups: SectionGroups = [
  ["basedOn", "learningOutcome", "learningCycles"],
  ["priorKnowledge", "keyLearningPoints", "misconceptions", "keywords"],
  ["starterQuiz", "cycle1", "cycle2", "cycle3", "exitQuiz"],
  ["additionalMaterials"],
];
