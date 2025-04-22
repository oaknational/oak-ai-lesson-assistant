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
  return key.replace(/(_\w)/g, (_, m) => m[1].toUpperCase());
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
      keysToCamelCase(item),
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

export const rawQuizFixture: NonNullable<RawQuiz> = keysToCamelCase([
  {
    hint: "Think about the words increase and decrease. You could think of adding and subtracting.",
    active: false,
    answers: {
      "short-answer": [
        {
          answer: [
            {
              text: "8",
              type: "text",
            },
          ],
          answer_is_default: true,
        },
        {
          answer: [
            {
              text: "eight",
              type: "text",
            },
          ],
          answer_is_default: false,
        },
      ],
    },
    feedback: "Yes, adjacent multiples have a difference of 8.",
    questionId: 229205,
    questionUid: "QUES-BPWF2-29205",
    questionStem: [
      {
        text: "Adjacent multiples of 8 can be found by increasing or decreasing a multiple by {{ }}.",
        type: "text",
      },
    ],
    questionType: "short-answer",
  },
  {
    hint: "Adjacent multiples of 8 have a difference of 8. Which numbers have a difference of 8 when compared to 40?",
    active: false,
    answers: {
      "multiple-choice": [
        {
          answer: [
            {
              text: "34",
              type: "text",
            },
          ],
          answer_is_correct: false,
        },
        {
          answer: [
            {
              text: "32",
              type: "text",
            },
          ],
          answer_is_correct: true,
        },
        {
          answer: [
            {
              text: "50",
              type: "text",
            },
          ],
          answer_is_correct: false,
        },
        {
          answer: [
            {
              text: "48",
              type: "text",
            },
          ],
          answer_is_correct: true,
        },
        {
          answer: [
            {
              text: "47",
              type: "text",
            },
          ],
          answer_is_correct: false,
        },
      ],
    },
    feedback:
      "32 is 8 less than 40. 48 is 8 more than 8. They are adjacent multiples.",
    questionId: 229206,
    questionUid: "QUES-RLYY2-29206",
    questionStem: [
      {
        text: "40 is a multiple of 8. Which multiples of 8 are adjacent to 40?",
        type: "text",
      },
      {
        type: "image",
        image_object: {
          id: "aebbea4ff62b4d0cc44b3b13915db5b0",
          url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1706266807/a3g7nwse0lqdvrggp1vt.png",
          tags: [],
          type: "upload",
          bytes: 2006,
          width: 283,
          format: "png",
          height: 118,
          context: {
            custom: {
              alt: "a number of squares with the number forty on it and the number forty on the side of the square",
            },
          },
          version: 1706266807,
          duration: null,
          metadata: {
            source: "Oak Created",
            usageRestrictions: "ogl__open_government_license_",
            attribution_required: "no",
          },
          folder_id: "c69db7cc3f32c1046bbb01cdd79651c45f",
          public_id: "a3g7nwse0lqdvrggp1vt",
          created_at: "2024-01-26T11:00:07Z",
          created_by: {
            id: "8fc0b3831a99ff826014a52ed3d3c7",
            type: "user",
          },
          secure_url:
            "https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266807/a3g7nwse0lqdvrggp1vt.png",
          access_mode: "public",
          uploaded_by: {
            id: "8fc0b3831a99ff826014a52ed3d3c7",
            type: "user",
          },
          display_name: "Y3.U11.E7.2",
          resource_type: "image",
          access_control: [],
        },
      },
    ],
    questionType: "multiple-choice",
  },
  {
    hint: "The missing number is the fourth multiple of 8. How can you use the adjacent multiples?",
    active: false,
    answers: {
      "multiple-choice": [
        {
          answer: [
            {
              text: "5 × 8 − 8",
              type: "text",
            },
          ],
          answer_is_correct: true,
        },
        {
          answer: [
            {
              text: "4 groups of 8",
              type: "text",
            },
          ],
          answer_is_correct: false,
        },
        {
          answer: [
            {
              text: "3 × 8 + 8",
              type: "text",
            },
          ],
          answer_is_correct: true,
        },
        {
          answer: [
            {
              text: "8 x 4",
              type: "text",
            },
          ],
          answer_is_correct: false,
        },
      ],
    },
    feedback:
      "You have used the adjacent multiples and then increased or decreased the number by 8.",
    questionId: 229207,
    questionUid: "QUES-XRES2-29207",
    questionStem: [
      {
        text: "Which mixed operation equation can be used to calculate the missing multiple of 8?",
        type: "text",
      },
      {
        type: "image",
        image_object: {
          id: "6ed5adeada56a84cf2124699a21ba7cf",
          url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1706266808/pggweqwl9chfutuul4pm.png",
          tags: [],
          type: "upload",
          bytes: 7173,
          width: 522,
          format: "png",
          height: 157,
          context: {
            custom: {
              alt: "a number line with a square in the middle and a rectangle in the middle of the line on the bottom of the line",
            },
          },
          version: 1706266808,
          duration: null,
          metadata: {
            source: "Oak Created",
            usageRestrictions: "ogl__open_government_license_",
            attribution_required: "no",
          },
          folder_id: "c69db7cc3f32c1046bbb01cdd79651c45f",
          public_id: "pggweqwl9chfutuul4pm",
          created_at: "2024-01-26T11:00:08Z",
          created_by: {
            id: "8fc0b3831a99ff826014a52ed3d3c7",
            type: "user",
          },
          secure_url:
            "https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266808/pggweqwl9chfutuul4pm.png",
          access_mode: "public",
          uploaded_by: {
            id: "8fc0b3831a99ff826014a52ed3d3c7",
            type: "user",
          },
          display_name: "Y3.U11.E7.3",
          resource_type: "image",
          access_control: [],
        },
      },
    ],
    questionType: "multiple-choice",
  },
  {
    hint: "Look at the mixed operation equation. How many groups of 8 does each show? Match to the products.",
    active: false,
    answers: {
      match: [
        {
          match_option: [
            {
              text: "16 =",
              type: "text",
            },
          ],
          correct_choice: [
            {
              text: "1 x 8 + 8",
              type: "text",
            },
          ],
        },
        {
          match_option: [
            {
              text: "24 = ",
              type: "text",
            },
          ],
          correct_choice: [
            {
              text: "2 x 8 + 8",
              type: "text",
            },
          ],
        },
        {
          match_option: [
            {
              text: "32 =",
              type: "text",
            },
          ],
          correct_choice: [
            {
              text: "3 x 8 + 8",
              type: "text",
            },
          ],
        },
        {
          match_option: [
            {
              text: "40 = ",
              type: "text",
            },
          ],
          correct_choice: [
            {
              text: "4 × 8 + 8",
              type: "text",
            },
          ],
        },
      ],
    },
    feedback: "You have correctly matched the equations to the products.",
    questionId: 229208,
    questionUid: "QUES-RKQC2-29208",
    questionStem: [
      {
        text: "Match the products to the correct mixed operation equation.",
        type: "text",
      },
    ],
    questionType: "match",
  },
  {
    hint: "Look at each choice. 13 × 8 is adjacent to which known fact?",
    active: false,
    answers: {
      "multiple-choice": [
        {
          answer: [
            {
              text: "12 x 8 + 8",
              type: "text",
            },
          ],
          answer_is_correct: true,
        },
        {
          answer: [
            {
              text: "Count in eights from zero",
              type: "text",
            },
          ],
          answer_is_correct: false,
        },
        {
          answer: [
            {
              text: "Increase 96 by 8",
              type: "text",
            },
          ],
          answer_is_correct: true,
        },
      ],
    },
    feedback: "You used adjacent multiples of 8.",
    questionId: 229209,
    questionUid: "QUES-FZZN2-29209",
    questionStem: [
      {
        text: "Here is part of the 8 times table grid. What could Izzy do to find 13 × 8 quickly? ",
        type: "text",
      },
      {
        type: "image",
        image_object: {
          id: "82797de082e97c33bba31c3c018e5d76",
          url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1706266809/pm6upn12cjexhp4xcccg.png",
          tags: [],
          type: "upload",
          bytes: 14958,
          width: 391,
          format: "png",
          height: 366,
          context: {
            custom: {
              alt: "a table with a number of times on it and a table with the same number of times on it",
            },
          },
          version: 1706266809,
          duration: null,
          metadata: {
            source: "Oak Created",
            usageRestrictions: "ogl__open_government_license_",
            attribution_required: "no",
          },
          folder_id: "c69db7cc3f32c1046bbb01cdd79651c45f",
          public_id: "pm6upn12cjexhp4xcccg",
          created_at: "2024-01-26T11:00:09Z",
          created_by: {
            id: "8fc0b3831a99ff826014a52ed3d3c7",
            type: "user",
          },
          secure_url:
            "https://oaknationalacademy-res.cloudinary.com/image/upload/v1706266809/pm6upn12cjexhp4xcccg.png",
          access_mode: "public",
          uploaded_by: {
            id: "8fc0b3831a99ff826014a52ed3d3c7",
            type: "user",
          },
          display_name: "Y3.U11.E7.5",
          resource_type: "image",
          access_control: [],
        },
      },
    ],
    questionType: "multiple-choice",
  },
  {
    hint: "Look carefully at the number of groups of 8.",
    active: false,
    answers: {
      order: [
        {
          answer: [
            {
              text: "7 × 8",
              type: "text",
            },
          ],
          correct_order: 1,
        },
        {
          answer: [
            {
              text: "8 × 6",
              type: "text",
            },
          ],
          correct_order: 2,
        },
        {
          answer: [
            {
              text: "5 × 8",
              type: "text",
            },
          ],
          correct_order: 3,
        },
        {
          answer: [
            {
              text: "8 × 3",
              type: "text",
            },
          ],
          correct_order: 4,
        },
      ],
    },
    feedback: "You correctly ordered the multiples of 8.",
    questionId: 229210,
    questionUid: "QUES-LMDM2-29210",
    questionStem: [
      {
        text: "Using your knowledge of groups, order the expressions starting with the greatest multiple.",
        type: "text",
      },
    ],
    questionType: "order",
  },
]);
