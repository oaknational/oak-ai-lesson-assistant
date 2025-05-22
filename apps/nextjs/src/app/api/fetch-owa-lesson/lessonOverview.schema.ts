import {
  lessonContentSchema as lessonContentSchemaFull,
  syntheticUnitvariantLessonsSchema,
} from "@oaknational/oak-curriculum-schema";
import { z } from "zod";

import { ConvertKeysToCamelCase } from "@/utils/snakeCaseConverter";

import {
  baseLessonOverviewSchema,
  lessonPathwaySchema,
} from "../../shared.schema";
import { mediaClipsRecordCamelSchema } from "../lessonMediaClips/lessonMediaClips.schema";
import { QuizQuestion } from "../pupilLesson/pupilLesson.schema";

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
