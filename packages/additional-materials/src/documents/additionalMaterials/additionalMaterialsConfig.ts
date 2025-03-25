import type { LooseLessonPlan } from "../../../../aila/src/protocol/schema";
import type { DocumentConfig } from "../documentConfig";
import {
  comprehensionTaskSchema,
  homeworkMaterialSchema,
  sciencePracticalActivitySchema,
} from "../schemas/additionalMaterials";
import {
  additionalComprehensionPrompt,
  additionalComprehensionSystemPrompt,
  additionalHomeworkPrompt,
  additionalHomeworkSystemPrompt,
  additionalSciencePracticalActivityPrompt,
  additionalSciencePracticalActivitySystemPrompt,
} from "./additionalMaterialsPrompts";

export type AdditionalMaterialPromptContext = {
  lessonPlan: LooseLessonPlan;
  previousOutput?: object | null;
  message?: string | null;
  transcript?: string;
};

export const additionalMaterialsConfig: DocumentConfig<AdditionalMaterialPromptContext> =
  {
    "additional-homework": {
      schema: homeworkMaterialSchema,
      getPrompt: ({ lessonPlan, previousOutput, message }) => ({
        prompt: additionalHomeworkPrompt(lessonPlan, previousOutput, message),
        systemMessage: additionalHomeworkSystemPrompt(),
      }),
    },
    "additional-comprehension": {
      schema: comprehensionTaskSchema,
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
      schema: sciencePracticalActivitySchema,
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
