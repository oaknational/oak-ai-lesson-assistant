import {
  lessonContentSchema as lessonContentSchemaFull,
  syntheticUnitvariantLessonsSchema,
} from "@oaknational/oak-curriculum-schema";
import type { z } from "zod";

export const lessonContentSchema = lessonContentSchemaFull.pick({
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
});

export const lessonBrowseDataByKsSchema =
  syntheticUnitvariantLessonsSchema.omit({
    supplementary_data: true,
    null_unitvariant_id: true,
    lesson_data: true,
  });

export type LessonBrowseDataByKsSchema = z.infer<
  typeof lessonBrowseDataByKsSchema
>;

export type LessonContentSchema = z.infer<typeof lessonContentSchema>;
