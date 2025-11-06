import type {
  LakeraGuardResponse,
  Message,
} from "@oakai/additional-materials/src/threatDetection/lakeraThreatCheck";
import { SafetyViolations, inngest } from "@oakai/core";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import * as Sentry from "@sentry/nextjs";

const log = aiLogger("additional-materials");

/**
 * Formatted threat detection data for Slack notifications
 */
export interface ThreatDetectionForSlack {
  flagged: boolean;
  userInput: string;
  detectedThreats: Array<{
    detectorType: string;
    detectorId: string;
  }>;
  requestId?: string;
}

/**
 * Format Lakera threat detection result for Slack notification
 *
 * Extracts only the useful information:
 * - User's input that triggered the threat
 * - List of detected threats (filtered to only those with detected: true)
 * - Request UUID for traceability

 *
 * @param lakeraResult - The Lakera Guard API response
 * @param messages - The messages that were checked for threats
 * @returns Formatted threat detection data for Slack
 */
export function formatThreatDetectionForSlack(
  lakeraResult: LakeraGuardResponse,
  messages: Message[],
): ThreatDetectionForSlack {
  // Extract user input from messages (without role prefix for cleaner display)
  const userInput = messages.map((msg) => msg.content).join("\n");

  // Filter to only detected threats and extract relevant info
  const detectedThreats =
    lakeraResult.breakdown
      ?.filter((item) => item.detected)
      .map((item) => ({
        detectorType: item.detector_type,
        detectorId: item.detector_id,
      })) ?? [];

  return {
    flagged: lakeraResult.flagged,
    userInput,
    detectedThreats,
    requestId: lakeraResult.metadata?.request_uuid,
  };
}

export async function recordSafetyViolation({
  prisma,
  auth,
  interactionId,
  violationType,
  userAction,
  moderation,
  threatDetection,
}: {
  prisma: PrismaClientWithAccelerate;
  auth: SignedInAuthObject;
  interactionId: string;
  violationType: "MODERATION" | "THREAT";
  userAction: "PARTIAL_LESSON_GENERATION" | "ADDITIONAL_MATERIAL_GENERATION";
  moderation: ModerationResult;
  threatDetection?: ThreatDetectionForSlack;
}) {
  const safetyViolations = new SafetyViolations(prisma, console);
  try {
    log.info("Sending slack notification");
    await inngest.send({
      name: "app/slack.notifySafetyViolationsTeachingMaterials",
      user: {
        id: auth.userId,
      },
      data: {
        id: interactionId,
        categories: moderation.categories || [],
        justification: moderation.justification ?? "No justification provided",
        userAction,
        violationType,
        threatDetection: threatDetection ?? undefined,
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
