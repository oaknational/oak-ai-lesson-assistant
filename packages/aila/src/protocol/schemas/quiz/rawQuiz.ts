import type {
  imageItemSchema,
  quizQuestionSchema,
  textItemSchema,
} from "@oaknational/oak-curriculum-schema";
import {
  matchSchema,
  multipleChoiceSchema,
  orderSchema,
  shortAnswerSchema,
} from "@oaknational/oak-curriculum-schema";
import { z } from "zod";

// Direct types from Oak's schema without any conversion

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizQuestionAnswers = NonNullable<
  z.infer<typeof quizQuestionSchema>["answers"]
>;

export type MCAnswer = z.infer<typeof multipleChoiceSchema>;
export type ShortAnswer = z.infer<typeof shortAnswerSchema>;
export type OrderAnswer = z.infer<typeof orderSchema>;
export type MatchAnswer = z.infer<typeof matchSchema>;

export type ImageItem = z.infer<typeof imageItemSchema>;
export type TextItem = z.infer<typeof textItemSchema>;
export type ImageOrTextItem = ImageItem | TextItem;

const stemTextObjectSchema = z.object({
  text: z.string(),
  type: z.literal("text"),
});

export type StemTextObject = z.infer<typeof stemTextObjectSchema>;

const stemImageObjectSchema = z.object({
  image_object: z.object({
    format: z.enum(["png", "jpg", "jpeg", "webp", "gif", "svg"]).optional(),
    secure_url: z.string().url(),
    url: z.string().url().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
    metadata: z.union([
      z.array(z.unknown()),
      z.object({
        attribution: z.string().optional(),
        usageRestriction: z.string().optional(),
      }),
    ]),
    public_id: z.string().optional(),
    version: z.number().optional(),
  }),
  type: z.literal("image"),
});

export type StemImageObject = z.infer<typeof stemImageObjectSchema>;
export type StemObject = StemTextObject | StemImageObject;

const answersSchema = z.object({
  "multiple-choice": z.array(multipleChoiceSchema).nullable().optional(),
  match: z.array(matchSchema).nullable().optional(),
  order: z.array(orderSchema).nullable().optional(),
  "short-answer": z.array(shortAnswerSchema).nullable().optional(),
  "explanatory-text": z.null().optional(),
});

export const rawQuizQuestionSchema = z.object({
  question_id: z.number(),
  question_uid: z.string(),
  question_type: z.enum([
    "multiple-choice",
    "match",
    "order",
    "short-answer",
    "explanatory-text",
  ]),
  question_stem: z
    .array(z.union([stemTextObjectSchema, stemImageObjectSchema]))
    .min(1),
  answers: answersSchema.nullable().optional(),
  feedback: z.string(),
  hint: z.string(),
  active: z.boolean(),
});

export const rawQuizSchema = z
  .array(rawQuizQuestionSchema)
  .nullable()
  .optional();

export type RawQuiz = z.infer<typeof rawQuizSchema>;
export type QuizProps = {
  questions: NonNullable<RawQuiz>;
  imageAttribution: { attribution: string; questionNumber: string }[];
  isMathJaxLesson: boolean;
};
