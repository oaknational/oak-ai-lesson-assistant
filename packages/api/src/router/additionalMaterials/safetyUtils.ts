import { SafetyViolations, inngest } from "@oakai/core";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import * as Sentry from "@sentry/nextjs";

const log = aiLogger("additional-materials");

export async function recordSafetyViolation({
  prisma,
  auth,
  interactionId,
  violationType,
  userAction,
  moderation,
}: {
  prisma: PrismaClientWithAccelerate;
  auth: SignedInAuthObject;
  interactionId: string;
  violationType: "MODERATION" | "THREAT";
  userAction: "PARTIAL_LESSON_GENERATION" | "ADDITIONAL_MATERIAL_GENERATION";
  moderation: ModerationResult;
}) {
  const safetyViolations = new SafetyViolations(prisma, console);
  try {
    log.info("Sending slack notification");
    await inngest.send({
      name: "app/slack.notifyModerationTeachingMaterials",
      user: {
        id: auth.userId,
      },
      data: {
        id: interactionId,
        categories: moderation.categories || [],
        justification: moderation.justification ?? "No justification provided",
        userAction,
        violationType,
      },
    });
    await safetyViolations.recordViolation(
      auth.userId,
      userAction,
      violationType,
      "ADDITIONAL_MATERIAL_SESSION",
      interactionId,
    );
  } catch (e) {
    if (e instanceof UserBannedError) {
      log.info(`User ${auth.userId} is banned.`);
      throw e;
    }
    Sentry.captureException(e);
    log.error(
      `Failed to record ${violationType.toLowerCase()} safety violation`,
      e,
    );
  }
}
