import { type ZodSchema, type ZodType, z } from "zod";

import { partialLessonContextSchema } from "../partialLessonPlan/schema";
import { glossaryContextSchema, glossarySchema } from ".//glossary/schema";
import {
  buildComprehensionPrompt,
  buildComprehensionSystemMessage,
} from "./comprehension/buildComprehensionPrompt";
import {
  comprehensionContextSchema,
  comprehensionTaskSchema,
} from "./comprehension/schema";
import {
  buildGlossaryPrompt,
  buildGlossarySystemMessage,
} from "./glossary/buildGlossaryPrompt";

// -----------------------
// Base Types
// -----------------------

const additionalMaterialDocType = [
  "additional-comprehension",
  "additional-glossary",
  // "partial-lesson-plan",
] as const;

export const actionEnum = z.enum(["generate", "refine", "translate"]);

export type Action = z.infer<typeof actionEnum>;

export const additionalMaterialTypeEnum = z.enum(additionalMaterialDocType);

export type AdditionalMaterialType = z.infer<typeof additionalMaterialTypeEnum>;

// -----------------------
// Schema Maps
// -----------------------

// Prompt context map
export const additionalMaterialContextSchemasMap = {
  "additional-comprehension": comprehensionContextSchema,
  "additional-glossary": glossaryContextSchema,
  // "partial-lesson-plan": partialLessonContextSchema,
} satisfies {
  [K in AdditionalMaterialType]: ZodSchema;
};

export type ContextByMaterialType = {
  [K in AdditionalMaterialType]: z.infer<
    (typeof additionalMaterialContextSchemasMap)[K]
  >;
};

// LLM output schema map
export const additionalMaterialSchemasMap = {
  "additional-comprehension": comprehensionTaskSchema,
  "additional-glossary": glossarySchema,
} satisfies {
  [K in AdditionalMaterialType]: ZodSchema;
};

export type AdditionalMaterialSchemas = z.infer<
  (typeof additionalMaterialSchemasMap)[keyof typeof additionalMaterialSchemasMap]
>;
export type AdditionalMaterialSchemasMap = typeof additionalMaterialSchemasMap;

// Prompt builder map
export const additionalMaterialPromptBuilderMap = {
  "additional-comprehension": {
    buildSystemMessage: buildComprehensionSystemMessage,
    buildPrompt: buildComprehensionPrompt,
  },
  "additional-glossary": {
    buildPrompt: buildGlossaryPrompt,
    buildSystemMessage: buildGlossarySystemMessage,
  },
} satisfies {
  [K in AdditionalMaterialType]: {
    buildSystemMessage: () => string;
    buildPrompt: (context: ContextByMaterialType[K], action: Action) => string;
  };
};

// -----------------------
//  Additional Material Config Map
// -----------------------

const additionalMaterialVersions: Record<AdditionalMaterialType, number> = {
  "additional-comprehension": 1,
  "additional-glossary": 1,
};

type AdditionalMaterialsConfigMap = {
  [K in AdditionalMaterialType]: {
    systemMessage: () => string;
    buildPrompt: (context: ContextByMaterialType[K], action: Action) => string;
    schema: ZodType;
    promptContextSchema: ZodType;
    version: number;
  };
};

export const additionalMaterialsConfigMap = additionalMaterialDocType.reduce(
  (acc, type) => {
    acc[type] = {
      systemMessage:
        additionalMaterialPromptBuilderMap[type].buildSystemMessage,
      buildPrompt: additionalMaterialPromptBuilderMap[type].buildPrompt,
      schema: additionalMaterialSchemasMap[type],
      promptContextSchema: additionalMaterialContextSchemasMap[type],
      version: additionalMaterialVersions[type],
    };
    return acc;
  },
  {} as Record<AdditionalMaterialType, unknown>,
) as AdditionalMaterialsConfigMap;

// -----------------------
//  Discriminated Union
// -----------------------

function makeInputVariant<T extends AdditionalMaterialType>(
  documentType: T,
  context: (typeof additionalMaterialContextSchemasMap)[T],
) {
  return z.object({
    action: actionEnum,
    documentType: z.literal(documentType),
    context,
    resourceId: z.string().nullish(),
    lessonId: z.string().nullish(),
  });
}

export const generateAdditionalMaterialInputSchema = z.discriminatedUnion(
  "documentType",
  [
    makeInputVariant("additional-comprehension", comprehensionContextSchema),
    makeInputVariant("additional-glossary", glossaryContextSchema),
  ],
);

export type GenerateAdditionalMaterialInput = z.infer<
  typeof generateAdditionalMaterialInputSchema
>;
