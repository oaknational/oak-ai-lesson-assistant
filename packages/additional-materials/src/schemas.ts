import { z } from "zod";

import type { LooseLessonPlan } from "../../aila/src/protocol/schema";

export const oakOpenAiLessonSummarySchema = z.object({
  lessonTitle: z.string(),
  unitSlug: z.string(),
  unitTitle: z.string(),
  subjectSlug: z.string(),
  subjectTitle: z.string(),
  keyStageSlug: z.string(),
  keyStageTitle: z.string(),
  lessonKeywords: z.array(
    z.object({
      keyword: z.string(),
      description: z.string(),
    }),
  ),
  keyLearningPoints: z.array(
    z.object({
      keyLearningPoint: z.string(),
    }),
  ),
  misconceptionsAndCommonMistakes: z.array(
    z.object({
      misconception: z.string(),
      response: z.string(),
    }),
  ),
  pupilLessonOutcome: z.string(),
  teacherTips: z.array(
    z.object({
      teacherTip: z.string(),
    }),
  ),
  contentGuidance: z.array(z.object({}).passthrough()).nullish(),
  supervisionLevel: z.string().nullable(),
  downloadsAvailable: z.boolean(),
});

export const oakOpenApiSearchSchema = z.array(
  z.object({
    lessonTitle: z.string(),
    lessonSlug: z.string(),
    similarity: z.number(),
    units: z.array(
      z.object({
        keyStageSlug: z.string(),
        subjectSlug: z.string(),
        unitSlug: z.string(),
        unitTitle: z.string(),
        examBoardTitle: z.string().nullable(),
      }),
    ),
  }),
);

export type OakOpenApiSearchSchema = z.infer<typeof oakOpenApiSearchSchema>;

export function mapLessonToSchema(
  lessonData: OakOpenAiLessonSummary,
): Partial<LooseLessonPlan> {
  return {
    title: lessonData.lessonTitle,
    keyStage: lessonData.keyStageSlug,
    subject: lessonData.subjectTitle,
    topic: lessonData.unitTitle,
    learningOutcome: lessonData.pupilLessonOutcome,
    learningCycles: [],
    priorKnowledge: [],
    keyLearningPoints: lessonData.keyLearningPoints.map(
      (point) => point.keyLearningPoint,
    ),
    misconceptions: lessonData.misconceptionsAndCommonMistakes.map(
      (misconception) => {
        return {
          misconception: misconception.misconception,
          description: misconception.response,
        };
      },
    ),
    keywords: lessonData.lessonKeywords.map((keyword) => {
      return {
        keyword: keyword.keyword,
        definition: keyword.description,
      };
    }),
    basedOn: undefined,
    starterQuiz: [],
    exitQuiz: [],
    additionalMaterials: "",
  };
}

export type OakOpenAiLessonSummary = z.infer<
  typeof oakOpenAiLessonSummarySchema
>;

export const oakOpenAiTranscriptSchema = z.object({
  transcript: z.string().nullish(),
  vtt: z.string().nullish(),
});

export type OakOpenAiTranscript = z.infer<typeof oakOpenAiTranscriptSchema>;

const sciencePracticalActivity = z.object({
  sciencePracticalActivity: z.object({
    practical_aim: z.string(),
    purpose_of_activity: z.string(),
    teachers_tip: z.string(),
    equipment: z.array(z.string()),
    method: z.array(z.string()),
    results_table: z.object({
      independent_variable: z.string(),
      dependent_variable: z.string(),
      example_results: z.object({
        example_independent_result_1: z.string(),
        example_dependent_result_1: z.string(),
        example_independent_result_2: z.string(),
        example_dependent_result_2: z.string(),
        example_independent_result_3: z.string(),
        example_dependent_result_3: z.string(),
      }),
    }),
    health_and_safety: z.array(z.string()),
    risk_assessment: z.string(),
  }),
});

export const comprehensionTaskSchema = z.object({
  comprehension: z.object({
    title: z.string().min(3).max(100),
    passage: z.string().min(20),
    questions: z.array(
      z.object({
        questionText: z.string().min(5),
        type: z.enum(["multiple-choice", "open-ended"]),
        options: z.array(z.string()).optional(),
        correctAnswer: z.union([z.string(), z.array(z.string())]),
      }),
    ),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  }),
});

export const homeworkMaterialSchema = z.object({
  homework: z.object({
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
    tasks: z
      .array(z.string())
      .min(1, "At least one task is required.")
      .max(3, "Maximum of 3 tasks allowed."),
  }),
});

export const schemaMap = {
  "additional-comprehension": comprehensionTaskSchema,
  "additional-homework": homeworkMaterialSchema,
  "additional-science-practical-activity": sciencePracticalActivity,
} as const;

export type SchemaMap = typeof schemaMap;
export type SchemaKey = keyof SchemaMap;
export type SchemaOutput<K extends SchemaKey> = z.infer<SchemaMap[K]>;

export type HomeworkMaterialType = z.infer<typeof homeworkMaterialSchema>;
export type ComprehensionTaskType = z.infer<typeof comprehensionTaskSchema>;
export type SciencePracticalActivityType = z.infer<
  typeof sciencePracticalActivity
>;

export type AdditionalMaterialType =
  | HomeworkMaterialType
  | ComprehensionTaskType
  | SciencePracticalActivityType;

export const isValidSchemaKey = (key: string): key is SchemaKey => {
  return key in schemaMap;
};

export const isHomeworkMaterial = (
  gen: AdditionalMaterialType | null,
): gen is HomeworkMaterialType => gen !== null && "homework" in gen;

export const isComprehensionMaterial = (
  gen: AdditionalMaterialType | null,
): gen is ComprehensionTaskType => gen !== null && "comprehension" in gen;

export const isSciencePracticalActivity = (
  gen: AdditionalMaterialType | null,
): gen is SciencePracticalActivityType =>
  gen !== null && "sciencePracticalActivity" in gen;
