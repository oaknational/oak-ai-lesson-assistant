import { z } from "zod";

import { LessonPlanSchema } from "../../../../aila/src/protocol/schema";

export type PartialLessonContextSchemaType = z.infer<
  typeof partialLessonContextSchema
>;
export const LessonPlanKeysSchema = z.enum(
  Object.keys(LessonPlanSchema.shape) as [keyof typeof LessonPlanSchema.shape],
);

export type LessonPlanKeysType = keyof z.infer<typeof LessonPlanSchema>;

export type LessonPlanField = keyof z.infer<typeof LessonPlanSchema>;

export const lessonFieldKeys = [
  "title",
  "keyStage",
  "subject",
  "learningOutcome",
  "learningCycles",
  "priorKnowledge",
  "keyLearningPoints",
  "misconceptions",
  "keywords",
  "starterQuiz",
  "cycle1",
  "cycle2",
  "cycle3",
  "exitQuiz",
] as const;

export const partialLessonPlanFieldKeys = z.enum(lessonFieldKeys);

export type PartialLessonPlanFieldKeys = z.infer<
  typeof partialLessonPlanFieldKeys
>;

const PartialLessonPlanFieldKeySchema = z.enum(lessonFieldKeys);

export const PartialLessonPlanFieldKeyArraySchema = z
  .array(PartialLessonPlanFieldKeySchema)
  .nonempty();

export const partialLessonContextSchema = z.object({
  keyStage: z.string().optional(),
  year: z.string(),
  subject: z.string(),
  title: z.string(),
  lessonParts: PartialLessonPlanFieldKeyArraySchema,
});
