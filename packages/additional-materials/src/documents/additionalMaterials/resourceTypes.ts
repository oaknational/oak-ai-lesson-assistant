import { type ZodType } from "zod";

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
};

// Complete resource type configuration
export type ResourceTypeConfig = {
  "additional-glossary": BaseResourceTypeConfig & {
    buildPrompt: (
      context: ContextByMaterialType["additional-glossary"],
      action: Action,
    ) => string;
  };
  "additional-comprehension": BaseResourceTypeConfig & {
    buildPrompt: (
      context: ContextByMaterialType["additional-comprehension"],
      action: Action,
    ) => string;
  };
  "additional-starter-quiz": BaseResourceTypeConfig & {
    buildPrompt: (
      context: ContextByMaterialType["additional-starter-quiz"],
      action: Action,
    ) => string;
  };
  "additional-exit-quiz": BaseResourceTypeConfig & {
    buildPrompt: (
      context: ContextByMaterialType["additional-exit-quiz"],
      action: Action,
    ) => string;
  };
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
    description: "Additional lesson vocabulary with pupil friendly definitions",
    refinementOptions: readingAgeRefinementOptions,
    componentType: "Glossary",
    isAvailable: true,
  },
  "additional-comprehension": {
    // Backend config
    ...additionalMaterialsConfigMap["additional-comprehension"],

    // Frontend config
    id: "additional-comprehension",
    displayName: "Comprehension tasks",
    description: "Comprehension tasks which can be adapted for pupils",
    refinementOptions: readingAgeRefinementOptions,
    componentType: "ComprehensionTask",
    isAvailable: true,
  },
  "additional-starter-quiz": {
    // Backend config
    ...additionalMaterialsConfigMap["additional-starter-quiz"],

    // Frontend config
    id: "additional-starter-quiz",
    displayName: "Starter Quiz",
    description: "A multiple-choice quiz to assess pupils' prior knowledge",
    refinementOptions: readingAgeRefinementOptions,
    componentType: "StarterQuiz",
    isAvailable: true,
  },
  "additional-exit-quiz": {
    // Backend config
    ...additionalMaterialsConfigMap["additional-exit-quiz"],

    // Frontend config
    id: "additional-exit-quiz",
    displayName: "Exit Quiz",
    description:
      "A multiple-choice quiz to assess pupils' learning from the lesson",
    refinementOptions: readingAgeRefinementOptions,
    componentType: "ExitQuiz",
    isAvailable: true,
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
