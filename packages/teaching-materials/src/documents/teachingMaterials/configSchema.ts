import { type ZodSchema, type ZodType, z } from "zod";

import {
  buildComprehensionPrompt,
  buildComprehensionSystemMessage,
} from "./comprehension/buildComprehensionPrompt";
import {
  comprehensionContextSchema,
  comprehensionTaskSchema,
} from "./comprehension/schema";
import {
  buildExitQuizPrompt,
  buildExitQuizSystemMessage,
} from "./exitQuiz/buildExitQuizPrompt";
import { exitQuizContextSchema, exitQuizSchema } from "./exitQuiz/schema";
import {
  buildGlossaryPrompt,
  buildGlossarySystemMessage,
} from "./glossary/buildGlossaryPrompt";
import { glossaryContextSchema, glossarySchema } from "./glossary/schema";
import {
  buildStarterQuizPrompt,
  buildStarterQuizSystemMessage,
} from "./starterQuiz/buildStarterQuizPrompt";
import {
  starterQuizContextSchema,
  starterQuizSchema,
} from "./starterQuiz/schema";

// -----------------------
// Base Types
// -----------------------

const teachingMaterialDocType = [
  "additional-comprehension",
  "additional-glossary",
  "additional-starter-quiz",
  "additional-exit-quiz",
] as const;

export const teachingMaterialTypeEnum = z.enum(teachingMaterialDocType);

export type TeachingMaterialType = z.infer<typeof teachingMaterialTypeEnum>;

// -----------------------
// Schema Maps
// -----------------------

// Prompt context map
export const teachingMaterialContextSchemasMap = {
  "additional-comprehension": comprehensionContextSchema,
  "additional-glossary": glossaryContextSchema,
  "additional-starter-quiz": starterQuizContextSchema,
  "additional-exit-quiz": exitQuizContextSchema,
  // "partial-lesson-plan": partialLessonContextSchema,
} satisfies {
  [K in TeachingMaterialType]: ZodSchema;
};

export type ContextByMaterialType = {
  [K in TeachingMaterialType]: z.infer<
    (typeof teachingMaterialContextSchemasMap)[K]
  >;
};

// LLM output schema map
export const teachingMaterialSchemasMap = {
  "additional-comprehension": comprehensionTaskSchema,
  "additional-glossary": glossarySchema,
  "additional-starter-quiz": starterQuizSchema,
  "additional-exit-quiz": exitQuizSchema,
} satisfies {
  [K in TeachingMaterialType]: ZodSchema;
};

export type TeachingMaterialSchemas = z.infer<
  (typeof teachingMaterialSchemasMap)[keyof typeof teachingMaterialSchemasMap]
>;
export type TeachingMaterialSchemasMap = typeof teachingMaterialSchemasMap;

// Prompt builder map
export const teachingMaterialPromptBuilderMap = {
  "additional-comprehension": {
    buildSystemMessage: buildComprehensionSystemMessage,
    buildPrompt: buildComprehensionPrompt,
  },
  "additional-glossary": {
    buildPrompt: buildGlossaryPrompt,
    buildSystemMessage: buildGlossarySystemMessage,
  },
  "additional-starter-quiz": {
    buildPrompt: buildStarterQuizPrompt,
    buildSystemMessage: buildStarterQuizSystemMessage,
  },
  "additional-exit-quiz": {
    buildPrompt: buildExitQuizPrompt,
    buildSystemMessage: buildExitQuizSystemMessage,
  },
} satisfies {
  [K in TeachingMaterialType]: {
    buildSystemMessage: () => string;
    buildPrompt: (context: ContextByMaterialType[K]) => string;
  };
};

// -----------------------
//  Additional Material Config Map
// -----------------------

const teachingMaterialVersions: Record<TeachingMaterialType, number> = {
  "additional-comprehension": 1,
  "additional-glossary": 1,
  "additional-starter-quiz": 1,
  "additional-exit-quiz": 1,
};

type TeachingMaterialsConfigMap = {
  [K in TeachingMaterialType]: {
    systemMessage: () => string;
    buildPrompt: (context: ContextByMaterialType[K]) => string;
    schema: ZodType;
    promptContextSchema: ZodType;
    version: number;
  };
};

export const teachingMaterialsConfigMap = teachingMaterialDocType.reduce(
  (acc, type) => {
    acc[type] = {
      systemMessage: teachingMaterialPromptBuilderMap[type].buildSystemMessage,
      buildPrompt: teachingMaterialPromptBuilderMap[type].buildPrompt,
      schema: teachingMaterialSchemasMap[type],
      promptContextSchema: teachingMaterialContextSchemasMap[type],
      version: teachingMaterialVersions[type],
    };
    return acc;
  },
  {} as Record<TeachingMaterialType, unknown>,
) as TeachingMaterialsConfigMap;

// -----------------------
//  Discriminated Union
// -----------------------

function makeInputVariant<T extends TeachingMaterialType>(
  documentType: T,
  context: (typeof teachingMaterialContextSchemasMap)[T],
) {
  return z.object({
    documentType: z.literal(documentType),
    context,
    resourceId: z.string().nullish(),
    lessonId: z.string().nullish(),
    adaptsOutputId: z.string().nullish(),
    source: z.enum(["aila", "owa"]),
  });
}

export const generateTeachingMaterialInputSchema = z.discriminatedUnion(
  "documentType",
  [
    makeInputVariant("additional-comprehension", comprehensionContextSchema),
    makeInputVariant("additional-glossary", glossaryContextSchema),
    makeInputVariant("additional-starter-quiz", starterQuizContextSchema),
    makeInputVariant("additional-exit-quiz", exitQuizContextSchema),
  ],
);

export type GenerateTeachingMaterialInput = z.infer<
  typeof generateTeachingMaterialInputSchema
>;

export { starterQuizSchema, exitQuizSchema };
