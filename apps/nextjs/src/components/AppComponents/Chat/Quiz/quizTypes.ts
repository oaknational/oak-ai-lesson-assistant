// Camelcased version of RawQuiz. To be replaced with QuizV2 structure
//
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

type SnakeToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}${infer Rest}`
    ? `${T}${Uppercase<U>}${SnakeToCamelCase<Rest>}`
    : S;
export type ConvertKeysToCamelCase<T> =
  T extends Array<infer U>
    ? Array<ConvertKeysToCamelCase<U>>
    : T extends object
      ? {
          [K in keyof T as SnakeToCamelCase<
            K & string
          >]: ConvertKeysToCamelCase<T[K]>;
        }
      : T;
export function convertKey(key: string): string {
  return key.replace(/(_\w)/g, (_, [, m]) => (m as string)?.toUpperCase());
}
export type QuizQuestion = ConvertKeysToCamelCase<
  z.infer<typeof quizQuestionSchema>
>;

export type QuizQuestionAnswers = NonNullable<
  ConvertKeysToCamelCase<z.infer<typeof quizQuestionSchema>["answers"]>
>;

export type MCAnswer = ConvertKeysToCamelCase<
  z.infer<typeof multipleChoiceSchema>
>;
export type ShortAnswer = ConvertKeysToCamelCase<
  z.infer<typeof shortAnswerSchema>
>;
export type OrderAnswer = ConvertKeysToCamelCase<z.infer<typeof orderSchema>>;
export type MatchAnswer = ConvertKeysToCamelCase<z.infer<typeof matchSchema>>;

export type ImageItem = ConvertKeysToCamelCase<z.infer<typeof imageItemSchema>>;
export type TextItem = ConvertKeysToCamelCase<z.infer<typeof textItemSchema>>;
export type ImageOrTextItem = ImageItem | TextItem;

const stemTextObjectSchema = z.object({
  text: z.string(),
  type: z.literal("text"),
});

export type StemTextObject = z.infer<typeof stemTextObjectSchema>;

const stemImageObjectSchema = z.object({
  imageObject: z.object({
    format: z.enum(["png", "jpg", "jpeg", "webp", "gif", "svg"]).optional(),
    secureUrl: z.string().url(),
    url: z.string().url().optional(),
    height: z.number().optional(),
    width: z.number().optional(),
    metadata: z.union([
      z.array(z.any()),
      z.object({
        attribution: z.string().optional(),
        usageRestriction: z.string().optional(),
      }),
    ]),
    publicId: z.string().optional(),
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
  questionId: z.number(),
  questionUid: z.string(),
  questionType: z.enum([
    "multiple-choice",
    "match",
    "order",
    "short-answer",
    "explanatory-text",
  ]),
  questionStem: z
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

export type RawQuiz = ConvertKeysToCamelCase<z.infer<typeof rawQuizSchema>>;
export type QuizProps = {
  questions: NonNullable<RawQuiz>;
  imageAttribution: { attribution: string; questionNumber: string }[];
  isMathJaxLesson: boolean;
};

export function keysToCamelCase<T>(obj: T): ConvertKeysToCamelCase<T> {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      keysToCamelCase(item as unknown[]),
    ) as ConvertKeysToCamelCase<T>;
  } else if (obj && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = convertKey(key);
      acc[newKey as keyof typeof acc] = keysToCamelCase(value);
      return acc;
    }, {} as ConvertKeysToCamelCase<T>);
  }
  return obj as ConvertKeysToCamelCase<T>;
}
