import { SafetyViolations } from "@oakai/core";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import * as Sentry from "@sentry/nextjs";

const log = aiLogger("additional-materials");

/**
 * Records a safety violation in the database
 */
export async function recordSafetyViolation({
  prisma,
  auth,
  interactionId,
  violationType,
  userAction,
}: {
  prisma: PrismaClientWithAccelerate;
  auth: SignedInAuthObject;
  interactionId: string;
  violationType: "MODERATION" | "THREAT";
  userAction: "PARTIAL_LESSON_GENERATION" | "ADDITIONAL_MATERIAL_GENERATION";
}) {
  const safetyViolations = new SafetyViolations(prisma, console);
  try {
    await safetyViolations.recordViolation(
      auth.userId,
      userAction,
      violationType,
      "ADDITIONAL_MATERIAL_SESSION",
      interactionId,
    );
  } catch (e) {
    Sentry.captureException(e);
    log.error(
      `Failed to record ${violationType.toLowerCase()} safety violation`,
      e,
    );
  }
}
