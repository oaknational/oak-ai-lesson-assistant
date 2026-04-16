import {
  lessonContentSchema as lessonContentSchemaFull,
  syntheticUnitvariantLessonsByKsSchema,
  syntheticUnitvariantLessonsSchema,
} from "@oaknational/oak-curriculum-schema";
import { z } from "zod";

export const lessonContentSchema = lessonContentSchemaFull
  .pick({
    lesson_id: true,
    lesson_title: true,
    lesson_slug: true,
    is_legacy: true,
    equipment_and_resources: true,
    lesson_keywords: true,
    misconceptions_and_common_mistakes: true,
    key_learning_points: true,
    pupil_lesson_outcome: true,
    content_guidance: true,
    transcript_sentences: true,
    starter_quiz: true,
    exit_quiz: true,
  })
  .extend({
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
    null_unitvariant_id: true,
    unit_data: true,
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
  });

export type LessonBrowseDataByKsSchema = z.infer<
  typeof lessonBrowseDataByKsSchema
>;

export type LessonContentSchema = z.infer<typeof lessonContentSchema>;

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
