// additionalMaterials/actionRegistry.ts
import type { ZodSchema } from "zod";

import type { LooseLessonPlan } from "../../aila/src/protocol/schema";
import {
  additionalComprehensionPrompt,
  additionalComprehensionSystemPrompt,
  additionalHomeworkPrompt,
  additionalHomeworkSystemPrompt,
  additionalSciencePracticalActivityPrompt,
  additionalSciencePracticalActivitySystemPrompt,
} from "./prompts/additionalMaterialsPrompts";
import { schemaMap } from "./schemas";

type PromptContext = {
  lessonPlan: LooseLessonPlan;
  previousOutput?: object | null;
  message?: string | null;
  transcript?: string;
};

export type ActionKey = keyof typeof schemaMap;

export const actionRegistry: Record<
  ActionKey,
  {
    schema: ZodSchema;
    getPrompt: (ctx: PromptContext) => {
      prompt: string;
      systemMessage?: string;
    };
  }
> = {
  "additional-homework": {
    schema: schemaMap["additional-homework"],
    getPrompt: ({ lessonPlan, previousOutput, message }) => ({
      prompt: additionalHomeworkPrompt(lessonPlan, previousOutput, message),
      systemMessage: additionalHomeworkSystemPrompt(),
    }),
  },
  "additional-comprehension": {
    schema: schemaMap["additional-comprehension"],
    getPrompt: ({ lessonPlan, previousOutput, message }) => ({
      prompt: additionalComprehensionPrompt(
        lessonPlan,
        previousOutput,
        message,
      ),
      systemMessage: additionalComprehensionSystemPrompt(),
    }),
  },
  "additional-science-practical-activity": {
    schema: schemaMap["additional-science-practical-activity"],
    getPrompt: ({ lessonPlan, previousOutput, message, transcript }) => ({
      prompt: additionalSciencePracticalActivityPrompt(
        lessonPlan,
        previousOutput,
        message,
        transcript,
      ),
      systemMessage: additionalSciencePracticalActivitySystemPrompt(),
    }),
  },
};
