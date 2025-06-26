import { z } from "zod";

import { LessonPlanSchema } from "../../../../aila/src/protocol/schema";

const lessonPlanSchemaTeachingMaterials = LessonPlanSchema.extend({
  year: z.string().optional(),
});
export type LessonPlanSchemaTeachingMaterials = z.infer<
  typeof lessonPlanSchemaTeachingMaterials
>;

export const baseContext = {
  lessonPlan: lessonPlanSchemaTeachingMaterials,
  transcript: z.string().nullish(),
  message: z.string().nullish(),
};
