import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("additional-materials");

/**
 * Gets an existing OWA lesson or creates a new one if it doesn't exist
 * This implements the deduplication strategy from the database plan
 */
export async function getOrCreateOwaLesson(
  prisma: PrismaClientWithAccelerate,
  lessonSlug: string,
  programmeSlug: string,
  transformedLessonData: unknown,
) {
  // 1. Check if already transformed
  const existingLesson = await prisma.additionalMaterialLesson.findUnique({
    where: {
      lessonSlug_programmeSlug: {
        lessonSlug,
        programmeSlug,
      },
    },
  });

  if (existingLesson) {
    log.info("Using existing transformed lesson", { lessonSlug, programmeSlug });
    return existingLesson;
  }

  // 2. Not found - store the transformed lesson
  const newLesson = await prisma.additionalMaterialLesson.create({
    data: {
      sourceType: "OWA_TRANSFORMED_LESSON",
      lessonSlug,
      programmeSlug,
      lessonData: transformedLessonData,
      schemaVersion: 1,
    },
  });

  log.info("Created new transformed lesson", { lessonSlug, programmeSlug });
  return newLesson;
}

/**
 * Creates an OWA lesson interaction that references the lesson
 */
export async function createOwaLessonInteraction(
  prisma: PrismaClientWithAccelerate,
  userId: string,
  lessonId: string,
) {
  const interaction = await prisma.additionalMaterialInteraction.create({
    data: {
      userId,
      lessonId,
      config: {
        resourceType: "owa-transformed-lesson",
        resourceTypeVersion: 1,
      },
      output: null, // No output - transformed lesson is in Lesson table
    },
  });

  return interaction;
}