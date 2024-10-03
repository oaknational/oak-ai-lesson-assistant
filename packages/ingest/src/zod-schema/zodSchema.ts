import { z } from "zod";

const MisconceptionSchema = z.object({
  misconception: z.string(),
  response: z.string(),
});
const KeyLearningPointSchema = z.object({
  keyLearningPoint: z.string(),
});
const LessonKeywordSchema = z.object({
  keyword: z.string(),
  description: z.string(),
});

export const RawLessonSchema = z.object({
  oakLessonId: z.number(),
  lessonTitle: z.string(),
  lessonSlug: z.string(),
  programmeSlug: z.string(),
  unitSlug: z.string(),
  keyStageSlug: z.string(),
  subjectSlug: z.string(),
  subjectTitle: z.string(),
  examBoardTitle: z.string().nullish(),
  tierTitle: z.string().nullish(),
  misconceptionsAndCommonMistakes: z.array(MisconceptionSchema).nullish(),
  keyLearningPoints: z.array(KeyLearningPointSchema).nullish(),
  pupilLessonOutcome: z.string().nullish(),
  lessonKeywords: z.array(LessonKeywordSchema).nullish(),
  copyrightContent: z.array(z.string()).nullish(),
  yearTitle: z.string().nullish(),
  videoTitle: z.string(),
  transcriptSentences: z.string().nullish(),
});

export type RawLesson = z.infer<typeof RawLessonSchema>;

export const CaptionsSchema = z.array(
  z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
  }),
);

export type Captions = z.infer<typeof CaptionsSchema>;

export const CompletionBatchResponseSchema = z.object({
  id: z.string(),
  custom_id: z.string(),
  response: z.object({
    request_id: z.string(),
    body: z.object({
      choices: z.array(
        z.object({
          message: z.object({
            content: z.string(),
          }),
        }),
      ),
    }),
  }),
  error: z.unknown(),
});

export const CompletionBatchErrorSchema = z.object({
  id: z.string(),
  custom_id: z.string(),
  response: z.object({
    body: z.object({
      error: z.object({
        message: z.string(),
      }),
    }),
  }),
});

export const EmbeddingsBatchResponseSchema = z.object({
  id: z.string(),
  custom_id: z.string(),
  response: z.object({
    request_id: z.string(),
    body: z.object({
      data: z.array(
        z.object({
          embedding: z.array(z.number()),
        }),
      ),
    }),
  }),
  error: z.unknown(),
});
