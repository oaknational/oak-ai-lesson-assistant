import { z } from "zod";

/**
 * Versioned lesson plan schema
 */
const StemSchema = z.array(
  z.union([
    z.object({
      type: z.literal("text"),
      text: z.string(),
    }),
    z.object({
      type: z.literal("image"),
      image: z.object({
        url: z.string().url(),
      }),
    }),
  ]),
);
export type Stem = z.infer<typeof StemSchema>;
export type StemItem = Stem[number];
const BaseQuestionSchema = z.object({
  questionStem: StemSchema,
});
const MultipleChoiceQuestionSchema = BaseQuestionSchema.extend({
  questionType: z.literal("multiple-choice"),
  answers: z.array(
    z.object({
      answer: StemSchema,
      correct: z.boolean(),
    }),
  ),
});

const ShortAnswerQuestionSchema = BaseQuestionSchema.extend({
  questionType: z.literal("short-answer"),
  answers: z.array(
    z.object({
      answer: StemSchema,
    }),
  ),
});

const MatchQuestionSchema = BaseQuestionSchema.extend({
  questionType: z.literal("match"),
  answers: z.array(z.tuple([StemSchema, StemSchema])),
});

const OrderQuestionSchema = BaseQuestionSchema.extend({
  questionType: z.literal("order"),
  answers: z.array(
    z.object({
      answer: StemSchema,
      position: z.number(),
    }),
  ),
});

export const VersionedQuizSchema_1 = z.object({
  version: z.literal("1"),
  quiz: z.array(
    z.union([
      MultipleChoiceQuestionSchema,
      ShortAnswerQuestionSchema,
      MatchQuestionSchema,
      OrderQuestionSchema,
    ]),
  ),
});

export type VersionedQuiz_1 = z.infer<typeof VersionedQuizSchema_1>;
