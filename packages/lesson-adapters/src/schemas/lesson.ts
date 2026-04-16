import { z } from "zod";

/**
 * Schema for a complete lesson version
 * Includes Google Slides link and all lesson details together
 */
export const adaptLessonVersionSchema = z.object({
  version: z.string(),
  presentationId: z.string(),
  slideDeckUrl: z.string().url(),
  commonMisconceptions: z.array(z.string()),
  keywords: z.array(z.string()),
  keyLearningPoints: z.array(z.string()),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * Main lesson schema with versioning
 */
export const adaptLessonSchema = z.object({
  current: adaptLessonVersionSchema,
  previous: z.array(adaptLessonVersionSchema).optional(),
});

// Type exports
export type AdaptLessonVersion = z.infer<typeof adaptLessonVersionSchema>;
export type AdaptLesson = z.infer<typeof adaptLessonSchema>;
