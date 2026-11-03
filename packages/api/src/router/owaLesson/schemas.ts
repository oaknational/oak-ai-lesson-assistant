import {
  imageItemSchema,
  imageObjectSchema,
  lessonContentSchema as lessonContentSchemaFull,
  multipleChoiceSchema,
  questionSchema,
  shortAnswerSchema,
  subjectSlugs,
  subjects,
  syntheticUnitvariantLessonsByKsSchema,
  syntheticUnitvariantLessonsSchema,
  textItemSchema,
} from "@oaknational/oak-curriculum-schema";
import { z } from "zod";

const subjectSchema = z.union([
  subjects,
  z.literal("Rule of law"),
  z.literal("Digital literacy"),
]);

const subjectSlugSchema = z.union([
  subjectSlugs,
  z.literal("rule-of-law"),
  z.literal("digital-literacy"),
]);

const programmeFieldsSchema = z
  .object({
    subject: subjectSchema.nullish(),
    subject_slug: subjectSlugSchema.nullish(),
    phase: z.string().nullish(),
    keystage: z.string().nullish(),
    year: z.string().nullish(),
  })
  .passthrough();

// curriculum-schema 2 is stricter than version 1 in ways lesson content isn't
// guaranteed to meet, and any one failure rejects the whole lesson. These
// schemas accept what version 1 did.

// Version 2 only allows an empty array or an attribution object as metadata
const lessonImageItemSchema = imageItemSchema.extend({
  image_object: imageObjectSchema.extend({
    metadata: z
      .union([
        z
          .object({ attribution: z.string(), usageRestriction: z.string() })
          .partial(),
        z.array(z.unknown()),
      ])
      .optional(),
  }),
});

const lessonTextOrImageItemSchema = z.union([
  textItemSchema,
  lessonImageItemSchema,
]);

// Version 2 describes quiz questions as database rows, which require _state
// and only allow text in short answers. The transformer drops the questions it
// can't use.
const lessonQuizAnswersSchema = questionSchema.shape.answers
  .unwrap()
  .unwrap()
  .extend({
    "multiple-choice": z
      .array(
        multipleChoiceSchema.extend({
          answer: z.array(lessonTextOrImageItemSchema.optional()),
        }),
      )
      .optional(),
    "short-answer": z
      .array(
        shortAnswerSchema.extend({
          answer: z.array(lessonTextOrImageItemSchema.optional()),
        }),
      )
      .optional(),
  });

export const lessonQuizQuestionSchema = questionSchema.extend({
  question_stem: z.array(lessonTextOrImageItemSchema).optional().nullable(),
  answers: lessonQuizAnswersSchema.optional().nullable(),
  _state: questionSchema.shape._state.optional(),
});

// Version 2 rejects tabs, newlines and backslashes in these fields
const lessonKeywordsSchema = z
  .array(z.object({ keyword: z.string(), description: z.string() }))
  .nullable();
const lessonMisconceptionsSchema = z
  .array(z.object({ misconception: z.string(), response: z.string() }))
  .nullable();
const lessonEquipmentSchema = z
  .array(z.object({ equipment: z.string() }))
  .nullable();

export type LessonQuizQuestion = z.infer<typeof lessonQuizQuestionSchema>;

export const lessonContentSchema = lessonContentSchemaFull
  .pick({
    lesson_id: true,
    lesson_title: true,
    lesson_slug: true,
    is_legacy: true,
    key_learning_points: true,
    pupil_lesson_outcome: true,
    content_guidance: true,
    transcript_sentences: true,
  })
  .extend({
    equipment_and_resources: lessonEquipmentSchema,
    lesson_keywords: lessonKeywordsSchema,
    misconceptions_and_common_mistakes: lessonMisconceptionsSchema,
    starter_quiz: z.array(lessonQuizQuestionSchema).optional().nullable(),
    exit_quiz: z.array(lessonQuizQuestionSchema).optional().nullable(),
    order_in_unit: z.number().optional(),

    unit_data: z
      .object({
        slug: z.string().optional(),
        title: z.string().optional(),
        prior_knowledge_requirements: z.string().optional(),
        connection_prior_unit_description: z.string().optional(),
      })
      .optional(),
  });

export const lessonBrowseDataByKsSchema = syntheticUnitvariantLessonsSchema
  .omit({
    supplementary_data: true,
    // Not requested by the lesson overview queries
    null_unitvariant_id: true,
    unitvariant_id: true,
    unit_data: true,
    programme_fields: true,
    actions: true,
  })
  .extend({
    lesson_data: z.object({
      lesson_uid: z.string().optional(),
      order_in_unit: z.number().optional(),
    }),
    unit_data: z.object({
      slug: z.string().optional(),
      title: z.string().optional(),
      prior_knowledge_requirements: z.array(z.string()).nullish(),
      connection_prior_unit_description: z.string().nullish(),
    }),
    programme_fields: programmeFieldsSchema,
  });

type LessonBrowseDataByKsSchemaBase = z.infer<
  typeof lessonBrowseDataByKsSchema
>;

export type LessonBrowseDataByKsSchema = LessonBrowseDataByKsSchemaBase & {
  programme_fields: {
    subject?: string | null;
    subject_slug?: string | null;
    phase?: string | null;
    keystage?: string | null;
    year?: string | null;
  };
};

export type LessonContentSchema = z.infer<typeof lessonContentSchema>;

export const lessonRestrictionLevelsSchema = z.object({
  tpc_works_max_restriction: z.string().nullish(),
  tpc_media_max_restriction: z.string().nullish(),
  features: z.record(z.string(), z.unknown()).nullish(),
});

export const unitDataSchema = z.array(syntheticUnitvariantLessonsByKsSchema);

export type UnitDataSchema = z.infer<typeof unitDataSchema>;

/**
 * Schema for lesson adapt page data
 * Picks only the fields needed for the lesson adaptation UI from existing schemas
 */

export const lessonAdaptContentSchema = lessonContentSchema.pick({
  lesson_title: true,
  pupil_lesson_outcome: true,
  key_learning_points: true,
  lesson_keywords: true,
  misconceptions_and_common_mistakes: true,
});

// Pick only the fields we need from browse data
export const lessonAdaptBrowseDataSchema = lessonBrowseDataByKsSchema
  .pick({
    programme_fields: true,
  })
  .extend({
    lesson_data: z.object({
      lesson_outline: z
        .array(z.object({ lesson_outline: z.string() }))
        .optional(),
    }),
  });

// Combined schema for the full lesson adapt data from API
export const lessonAdaptApiDataSchema = z.object({
  data: z.object({
    content: z.array(lessonAdaptContentSchema).min(1),
    browseData: z.array(lessonAdaptBrowseDataSchema).min(1),
  }),
});

export type LessonAdaptContentSchema = z.infer<typeof lessonAdaptContentSchema>;
export type LessonAdaptBrowseDataSchema = z.infer<
  typeof lessonAdaptBrowseDataSchema
>;
export type LessonAdaptApiDataSchema = z.infer<typeof lessonAdaptApiDataSchema>;
