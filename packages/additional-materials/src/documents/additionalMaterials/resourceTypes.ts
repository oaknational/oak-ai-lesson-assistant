import type {
  subjectSlugs,
  yearSlugs,
} from "@oaknational/oak-curriculum-schema";
import { type ZodType, type z } from "zod";

import type { PartialLessonPlanFieldKeyArray } from "../partialLessonPlan/schema";
import { additionalMaterialsConfigMap } from "./configSchema";
import {
  type AllowedReadingAgeRefinement,
  readingAgeRefinement,
  readingAgeRefinementMap,
} from "./glossary/schema";

// -----------------------
//  Subjects Configuration
// -----------------------

type SubjectSlugs = z.infer<typeof subjectSlugs>;

// Map subject slugs to display names
export const subjectNameMap: Partial<Record<SubjectSlugs, string>> = {
  science: "Science",
  spanish: "Spanish",
  maths: "Maths",
  german: "German",
  computing: "Computing",
  "financial-education": "Financial education",
  music: "Music",
  citizenship: "Citizenship",
  french: "French",
  "physical-education": "Physical Education",
  history: "History",
  latin: "Latin",
  "religious-education": "Religious education",
  "computing-non-gcse": "Computing (Non-GCSE)",
  drama: "Drama",
  biology: "Biology",
  chemistry: "Chemistry",
  english: "English",
  geography: "Geography",
  "design-technology": "Design and technology",
  art: "Art and design",
  "rshe-pshe": "RSHE (PSHE)",
  "combined-science": "Combined science",
  physics: "Physics",
  "cooking-nutrition": "Cooking and nutrition",
};

// Reverse map for getting slug from display name
export const subjectSlugMap: Record<string, string> = Object.fromEntries(
  Object.entries(subjectNameMap).map(([slug, name]) => [name, slug]),
);

// -----------------------
//  Year Groups Configuration
// -----------------------

type YearSlugs = z.infer<typeof yearSlugs>;

// Map year slugs to display names
export const yearNameMap: Partial<Record<YearSlugs, string>> = {
  "year-1": "Year 1",
  "year-2": "Year 2",
  "year-3": "Year 3",
  "year-4": "Year 4",
  "year-5": "Year 5",
  "year-6": "Year 6",
  "year-7": "Year 7",
  "year-8": "Year 8",
  "year-9": "Year 9",
  "year-10": "Year 10",
  "year-11": "Year 11",
};

// Reverse map for getting slug from display name
export const yearSlugMap: Record<string, string> = Object.fromEntries(
  Object.entries(yearNameMap).map(([slug, name]) => [name, slug]),
);

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
    analyticPropertyName: "glossary",
    displayName: "Glossary",
    description: "Additional lesson vocabulary with pupil friendly definitions",
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
    analyticPropertyName: "comprehension task",
    displayName: "Comprehension tasks",
    description: "Comprehension tasks which can be adapted for pupils",
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
    analyticPropertyName: "starter quiz",
    description: "A multiple-choice quiz to assess pupils' prior knowledge",
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
    analyticPropertyName: "starter quiz",
    displayName: "Exit quiz",
    description:
      "A multiple-choice quiz to assess pupils' learning from the lesson",
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
