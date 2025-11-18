import { z } from "zod";

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
export type OakOpenAiLessonSummary = z.infer<
  typeof oakOpenAiLessonSummarySchema
>;

export const oakOpenAiTranscriptSchema = z.object({
  transcript: z.string().nullish(),
  vtt: z.string().nullish(),
});

export type OakOpenAiTranscript = z.infer<typeof oakOpenAiTranscriptSchema>;
