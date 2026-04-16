import {
  SafetyViolations,
  UserBannedError,
  scheduleModerationTeachingMaterialsNotification,
  scheduleThreatDetectionTeachingMaterialsNotification,
} from "@oakai/core";
import type { ThreatDetectionResult } from "@oakai/core/src/threatDetection/types";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import * as Sentry from "@sentry/nextjs";

const log = aiLogger("teaching-materials");

type BaseSafetyViolationParams = {
  prisma: PrismaClientWithAccelerate;
  auth: SignedInAuthObject;
  interactionId: string;
  userAction: "PARTIAL_LESSON_GENERATION" | "ADDITIONAL_MATERIAL_GENERATION";
};

type ModerationViolationParams = BaseSafetyViolationParams & {
  violationType: "MODERATION";
  moderation: ModerationResult;
};

type ThreatViolationParams = BaseSafetyViolationParams & {
  violationType: "THREAT";
  threatDetection: ThreatDetectionResult;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
};

type SafetyViolationParams = ModerationViolationParams | ThreatViolationParams;

export async function recordSafetyViolation(params: SafetyViolationParams) {
  const { prisma, auth, interactionId, violationType, userAction } = params;
  const safetyViolations = new SafetyViolations(prisma);
  try {
    if (params.violationType === "THREAT") {
      await scheduleThreatDetectionTeachingMaterialsNotification({
        user: {
          id: auth.userId,
        },
        data: {
          id: interactionId,
          userAction,
          threatDetection: params.threatDetection,
          messages: params.messages,
        },
      });
    } else {
      await scheduleModerationTeachingMaterialsNotification({
        user: {
          id: auth.userId,
        },
        data: {
          id: interactionId,
          categories: params.moderation.categories || [],
          justification:
            params.moderation.justification ?? "No justification provided",
          userAction,
        },
      });
    }

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
