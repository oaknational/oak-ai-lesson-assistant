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

function keysToCamelCase<T>(obj: T): ConvertKeysToCamelCase<T> {
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
    hint: "You can either divide by 3 or expand the brackets as your first step.",
    active: false,
    answers: {
      "short-answer": [
        { answer: [{ text: "0", type: "text" }], answer_is_default: true },
        { answer: [{ text: "x = 0", type: "text" }], answer_is_default: false },
      ],
    },
    feedback:
      "Correctly rearranging to make $$x$$ the subject shows that $$x$$ = 0.",
    questionId: 49,
    questionUid: "QUES-ELSKM-WLQ49",
    questionStem: [
      { text: "Solve the equation $$3(x+12) = 36$$", type: "text" },
    ],
    questionType: "short-answer",
  },
  {
    hint: "Follow the vertices round the shape in order, which direction has it been labelled?",
    active: false,
    answers: {
      "short-answer": [
        {
          answer: [{ text: "anticlockwise", type: "text" }],
          answer_is_default: true,
        },
        {
          answer: [{ text: "anti-clockwise", type: "text" }],
          answer_is_default: false,
        },
      ],
    },
    feedback: "It is convention in mathematics to label anti-clockwise.",
    questionId: 6102,
    questionUid: "QUES-MYQWI-T6102",
    questionStem: [
      {
        text: "The vertices in the quadrilateral PQRS has been labelled in the {{ }} direction. ",
        type: "text",
      },
      {
        type: "image",
        image_object: {
          id: "a87671942c105f6e2d3ab890fc355395",
          url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1697614653/ghfidbooeqcj65lftjsy.png",
          tags: null,
          type: "upload",
          bytes: 17915,
          width: 401,
          format: "png",
          height: 338,
          version: 1697614653,
          duration: null,
          metadata: [],
          folder_id: "c55b91352e328a1e2072480778ff843c63",
          public_id: "ghfidbooeqcj65lftjsy",
          created_at: "2023-10-18T07:37:33Z",
          created_by: { id: "e041e401d4d6d68d68de7babe30f90", type: "user" },
          secure_url:
            "https://oaknationalacademy-res.cloudinary.com/image/upload/v1697614653/ghfidbooeqcj65lftjsy.png",
          access_mode: "public",
          uploaded_by: { id: "e041e401d4d6d68d68de7babe30f90", type: "user" },
          display_name: "7.10.1.s6",
          resource_type: "image",
          access_control: [],
        },
      },
    ],
    questionType: "short-answer",
  },
  {
    hint: "",
    active: true,
    answers: {
      "multiple-choice": [
        {
          answer: [{ text: "a half", type: "text" }],
          answer_is_correct: false,
        },
        {
          answer: [{ text: "a quarter", type: "text" }],
          answer_is_correct: true,
        },
        {
          answer: [{ text: "a whole", type: "text" }],
          answer_is_correct: false,
        },
      ],
    },
    feedback: "",
    questionId: 188098,
    questionUid: "QUES-EZZN1-88098",
    questionStem: [
      { text: "What is the capacity of each small container?", type: "text" },
      {
        type: "image",
        image_object: {
          url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1707169628/s33o8ra9zaljp4fbtumx.png",
          etag: "bdcd65ce0a5ea2d6a9a26bcb7ebb9dd0",
          info: {
            detection: {
              captioning: {
                data: {
                  caption:
                    "a diagram of a cylindrical cylinder and a cylindrical cylinder with the same height as the cylinder and the same height as the cylinder",
                },
                status: "complete",
                model_version: 1,
                schema_version: 1,
              },
            },
            visual_search: { clip: { status: "pending" } },
          },
          tags: ["legacy"],
          type: "upload",
          bytes: 26014,
          pages: 1,
          width: 740,
          format: "png",
          height: 229,
          api_key: "635387731176125",
          version: 1707169628,
          asset_id: "73971de354705344187815ef5115b3ff",
          metadata: {
            source: "legacy_data",
            usageRestrictions: "restricted_use",
            attribution_required: "no",
          },
          public_id: "s33o8ra9zaljp4fbtumx",
          signature: "7c92feef9073f951c1c51172534c74555bb9836c",
          created_at: "2024-02-05T21:47:08Z",
          legacy_url:
            "https://lh3.googleusercontent.com/GS9YGMnzk8noDiy3-pKYouXVvOB3RZxdt9RerYD8lT1TfFjfWf-lVk5ikrL1fE0GWGTaXQpvhNsNJ8uS5EFVHCIA-LWsvDWIwZLpYqKeBCV971hEa-GSlirKd9GFgUy6=w740",
          moderation: [{ kind: "manual", status: "pending" }],
          secure_url:
            "https://oaknationalacademy-res.cloudinary.com/image/upload/v1707169628/s33o8ra9zaljp4fbtumx.png",
          version_id: "3cbefa3b310638e3c99d4518c2e04dd2",
          placeholder: false,
          asset_folder: "Legacy content",
          display_name:
            "GS9YGMnzk8noDiy3-pKYouXVvOB3RZxdt9RerYD8lT1TfFjfWf-lVk5ikrL1fE0GWGTaXQpvhNsNJ8uS5EFVHCIA-LWsvDWIwZLpYqKeBCV971hEa-GSlirKd9GFgUy6=w740",
          resource_type: "image",
          original_filename:
            "GS9YGMnzk8noDiy3-pKYouXVvOB3RZxdt9RerYD8lT1TfFjfWf-lVk5ikrL1fE0GWGTaXQpvhNsNJ8uS5EFVHCIA-LWsvDWIwZLpYqKeBCV971hEa-GSlirKd9GFgUy6=w740",
        },
      },
    ],
    questionType: "multiple-choice",
  },
  {
    questionStem: [
      { text: "Match the calculations to their answer.", type: "text" },
    ],
    hint: "This is our ten times tables - we can count in tens to help us.",
    answers: {
      match: [
        {
          match_option: [{ text: "2 x 10 =", type: "text" }],
          correct_choice: [{ text: "20", type: "text" }],
        },
        {
          match_option: [{ text: "5 x 10 =", type: "text" }],
          correct_choice: [{ text: "50", type: "text" }],
        },
        {
          match_option: [{ text: "9 x 10 =", type: "text" }],
          correct_choice: [{ text: "90", type: "text" }],
        },
        {
          match_option: [{ text: "4 x 10 =", type: "text" }],
          correct_choice: [{ text: "40", type: "text" }],
        },
        {
          match_option: [{ text: "7 x 10", type: "text" }],
          correct_choice: [{ text: "70", type: "text" }],
        },
      ],
    },
    feedback:
      "Correct!  Our ten times tables help us when we learn about measure.",
    questionType: "match",
  },
  {
    questionStem: [
      {
        text: "Starting with the smallest volume, put these jugs in the order of the volume of liquid that they contain.",
        type: "text",
      },
      {
        type: "image",
        image_object: {
          id: "b21b08ba7a351b75d464c67cccbee312",
          url: "http://oaknationalacademy-res.cloudinary.com/image/upload/v1702034694/wed2hv585csolf2lo6dz.png",
          tags: null,
          type: "upload",
          bytes: 65742,
          width: 1388,
          format: "png",
          height: 690,
          context: {
            custom: {
              alt: "a drawing of a measuring cup with a measuring cup and a measuring cup with a measuring cup and a measuring cup with a measuring cup",
            },
          },
          version: 1702034694,
          duration: null,
          metadata: [],
          folder_id: "c61293129db2c33827c584d93d1e3b76a4",
          public_id: "wed2hv585csolf2lo6dz",
          created_at: "2023-12-08T11:24:54Z",
          created_by: { id: "da2308c5555d3ba94e08d48981aac4", type: "user" },
          secure_url:
            "https://oaknationalacademy-res.cloudinary.com/image/upload/v1702034694/wed2hv585csolf2lo6dz.png",
          access_mode: "public",
          uploaded_by: { id: "da2308c5555d3ba94e08d48981aac4", type: "user" },
          display_name: "Y3.6.5.S6",
          resource_type: "image",
          access_control: [],
        },
      },
    ],
    hint: "Look at the jugs. What do you notice about them and the level of water in each jug? Use the scale as a number line to help.",
    answers: {
      order: [
        { answer: [{ text: "C", type: "text" }], correct_order: 1 },
        { answer: [{ text: "B", type: "text" }], correct_order: 2 },
        { answer: [{ text: "A", type: "text" }], correct_order: 3 },
      ],
    },
    feedback:
      "Well done! Some of the jugs are different so we need to use their scales to help us. Although Jug C has a larger capacity, it is holding the smallest volume of liquid (250 ml), Jug B - 300 ml, Jug A - 400 ml.",
    questionType: "order",
  },
  {
    questionStem: [
      {
        text: "A sequence is defined as follows: Start with any positive integer value (𝑛). Each term is found from the previous term as follows: If the value is even, divide it by 2 (𝑛/2). If the value is odd, multiply it by 3 and add 1 (3𝑛+1).",
        type: "text",
      },
    ],
    hint: "",
    answers: {},
    feedback: "",
    questionType: "explanatory-text",
  },
]);
