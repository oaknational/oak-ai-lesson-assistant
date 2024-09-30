import { z } from "zod";

const QuizSchema = z.object({
  hint: z.string(),
  active: z.boolean(),
  answers: z.object({
    "multiple-choice": z.array(
      z.object({
        answer: z.array(
          z.object({
            text: z.string(),
            type: z.string(),
          }),
        ),
        answer_is_correct: z.boolean(),
      }),
    ),
  }),
  feedback: z.string(),
  questionId: z.number(),
  questionUid: z.string(),
  questionStem: z.array(
    z.object({
      text: z.string(),
      type: z.string(),
    }),
  ),
  questionType: z.string(),
});

export const RawLessonSchema = z.object({
  lessonId: z.number(),
  lessonSlug: z.string(),
  lessonTitle: z.string(),
  keyStageTitle: z.string(),
  keyStageSlug: z.string(),
  subjectSlug: z.string(),
  starterQuiz: z.array(QuizSchema),
  exitQuiz: z.array(QuizSchema),
});

export type RawLesson = z.infer<typeof RawLessonSchema>;

export const CaptionsSchema = z.array(
  z.object({
    end: z.number(),
    part: z.string(),
    start: z.number(),
  }),
);

export type Captions = z.infer<typeof CaptionsSchema>;
