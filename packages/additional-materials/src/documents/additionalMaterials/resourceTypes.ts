import { type ZodType } from "zod";

import type { PartialLessonPlanFieldKeyArray } from "../partialLessonPlan/schema";
import {
  type Action,
  type AdditionalMaterialType,
  type ContextByMaterialType,
  additionalMaterialsConfigMap,
} from "./configSchema";
import {
  type AllowedReadingAgeRefinement,
  readingAgeRefinement,
  readingAgeRefinementMap,
} from "./glossary/schema";

// -----------------------
//  Resource Type Configuration
// -----------------------

export type RefinementOption = {
  id: string;
  label: string;
  value: string;
};

// Common properties for all resource types
export type BaseResourceTypeConfig = {
  id: string;
  displayName: string;
  description: string;
  refinementOptions: RefinementOption[];
  componentType: string;
  isAvailable: boolean;
  systemMessage: () => string;
  schema: ZodType;
  promptContextSchema: ZodType;
  version: number;
  lessonParts: PartialLessonPlanFieldKeyArray;
};

const readingAgeRefinementOptions: RefinementOption[] = Array.from(
  readingAgeRefinement,
).map((id: AllowedReadingAgeRefinement) => ({
  id,
  label: readingAgeRefinementMap[id],
  value: id,
}));

export const resourceTypesConfig = {
  "additional-glossary": {
    // Backend config
    ...additionalMaterialsConfigMap["additional-glossary"],

    // Frontend config
    id: "additional-glossary",
    displayName: "Glossary",
    description: "Lesson vocabulary with pupil friendly definitions.",
    refinementOptions: readingAgeRefinementOptions,
    isAvailable: true,
    lessonParts: [
      "learningOutcome",
      "learningCycles",
      "keyLearningPoints",
      "misconceptions",
      "keywords",
    ],
  },
  "additional-comprehension": {
    // Backend config
    ...additionalMaterialsConfigMap["additional-comprehension"],

    // Frontend config
    id: "additional-comprehension",
    displayName: "Comprehension tasks",
    description: "Comprehension text with accompanying questions.",
    refinementOptions: readingAgeRefinementOptions,
    isAvailable: true,
    lessonParts: [
      "learningOutcome",
      "learningCycles",
      "keyLearningPoints",
      "misconceptions",
      "keywords",
    ],
  },
  "additional-starter-quiz": {
    // Backend config
    ...additionalMaterialsConfigMap["additional-starter-quiz"],

    // Frontend config
    id: "additional-starter-quiz",
    displayName: "Starter quiz",
    description: "Multiple choice questions to check pupils' prior knowledge.",
    refinementOptions: readingAgeRefinementOptions,
    isAvailable: true,
    lessonParts: [
      "learningOutcome",
      "learningCycles",
      "priorKnowledge",
      "keyLearningPoints",
      "misconceptions",
      "keywords",
    ],
  },
  "additional-exit-quiz": {
    // Backend config
    ...additionalMaterialsConfigMap["additional-exit-quiz"],

    // Frontend config
    id: "additional-exit-quiz",
    displayName: "Exit quiz",
    description:
      "Multiple choice questions to check what pupils have learnt in the lesson.",
    refinementOptions: readingAgeRefinementOptions,
    isAvailable: true,
    lessonParts: [
      "learningOutcome",
      "learningCycles",
      "priorKnowledge",
      "keyLearningPoints",
      "misconceptions",
      "keywords",
    ],
  },
} as const;

// Helper functions to access resource types
export function getResourceTypes(): Array<
  (typeof resourceTypesConfig)[keyof typeof resourceTypesConfig]
> {
  return Object.values(resourceTypesConfig);
}

export function getResourceType(
  id: string,
): (typeof resourceTypesConfig)[keyof typeof resourceTypesConfig] | null {
  return id in resourceTypesConfig
    ? resourceTypesConfig[id as keyof typeof resourceTypesConfig]
    : null;
}
