import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("aila:quiz");

/**
 * Helper functions for Prisma database queries
 * Used for debugging and inspection scripts
 */

/**
 * Get lesson slug from RAG lesson plan ID
 */
export async function getLessonSlugFromPlanId(
  planId: string,
): Promise<string | null> {
  try {
    const result = await prisma.ragLessonPlan.findUnique({
      where: { id: planId },
    });

    if (!result) {
      log.warn("Lesson plan not found for planId:", planId);
      return null;
    }

    return result.oakLessonSlug;
  } catch (error) {
    log.error("Error fetching lesson slug:", error);
    return null;
  }
}

/**
 * Get lesson plan by ID with full details
 */
export async function getLessonPlanById(planId: string) {
  try {
    const result = await prisma.ragLessonPlan.findUnique({
      where: { id: planId },
    });

    return result;
  } catch (error) {
    log.error("Error fetching lesson plan:", error);
    return null;
  }
}

/**
 * Search for lesson plans by slug pattern
 */
export async function findLessonPlansBySlugPattern(pattern: string) {
  try {
    const results = await prisma.ragLessonPlan.findMany({
      where: {
        oakLessonSlug: {
          contains: pattern,
        },
      },
      take: 20,
    });

    return results;
  } catch (error) {
    log.error("Error searching lesson plans:", error);
    return [];
  }
}
