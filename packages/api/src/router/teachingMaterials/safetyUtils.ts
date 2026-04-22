import {
  SafetyViolations,
  ThreatDetections,
  UserBannedError,
  scheduleModerationTeachingMaterialsNotification,
  scheduleThreatDetectionTeachingMaterialsNotification,
} from "@oakai/core";
import type { ThreatDetectionResult } from "@oakai/core/src/threatDetection/types";
import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import type { Prisma, PrismaClientWithAccelerate } from "@oakai/db";
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

type SafetyViolationDeps = {
  SafetyViolations?: typeof SafetyViolations;
  ThreatDetections?: typeof ThreatDetections;
  scheduleModerationTeachingMaterialsNotification?: typeof scheduleModerationTeachingMaterialsNotification;
  scheduleThreatDetectionTeachingMaterialsNotification?: typeof scheduleThreatDetectionTeachingMaterialsNotification;
};

export async function recordSafetyViolation(
  params: SafetyViolationParams,
  {
    SafetyViolations: SafetyViolationsClass = SafetyViolations,
    ThreatDetections: ThreatDetectionsClass = ThreatDetections,
    scheduleModerationTeachingMaterialsNotification:
      scheduleModerationNotification = scheduleModerationTeachingMaterialsNotification,
    scheduleThreatDetectionTeachingMaterialsNotification:
      scheduleThreatNotification = scheduleThreatDetectionTeachingMaterialsNotification,
  }: SafetyViolationDeps = {},
) {
  const { prisma, auth, interactionId, violationType, userAction } = params;
  const safetyViolations = new SafetyViolationsClass(prisma);
  try {
    if (params.violationType === "THREAT") {
      await scheduleThreatNotification({
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
      await recordThreatViolation({
        safetyViolations,
        threatDetections: new ThreatDetectionsClass(prisma),
        userId: auth.userId,
        interactionId,
        userAction,
        threatDetection: params.threatDetection,
        messages: params.messages,
      });
    } else {
      await scheduleModerationNotification({
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
      await safetyViolations.recordViolation(
        auth.userId,
        userAction,
        violationType,
        "ADDITIONAL_MATERIAL_SESSION",
        interactionId,
      );
    }
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

async function recordThreatViolation({
  safetyViolations,
  threatDetections,
  userId,
  interactionId,
  userAction,
  threatDetection,
  messages,
}: {
  safetyViolations: SafetyViolations;
  threatDetections: ThreatDetections;
  userId: string;
  interactionId: string;
  userAction: "PARTIAL_LESSON_GENERATION" | "ADDITIONAL_MATERIAL_GENERATION";
  threatDetection: ThreatDetectionResult;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
}) {
  let shouldCheckThreshold = false;
  let thresholdChecked = false;

  try {
    const safetyViolation = await safetyViolations.createViolation(
      userId,
      userAction,
      "THREAT",
      "ADDITIONAL_MATERIAL_SESSION",
      interactionId,
    );
    shouldCheckThreshold = true;

    await threatDetections.create({
      recordType: "ADDITIONAL_MATERIAL_SESSION",
      recordId: interactionId,
      userId,
      threateningMessage:
        getThreateningMessage(messages) ?? threatDetection.message,
      provider: threatDetection.provider,
      category: threatDetection.category,
      severity: threatDetection.severity,
      providerResponse: getProviderResponse(threatDetection.rawResponse),
      safetyViolationId: safetyViolation.id,
    });

    await safetyViolations.enforceThreshold(userId);
    thresholdChecked = true;
  } catch (e) {
    if (e instanceof UserBannedError) {
      throw e;
    }

    if (shouldCheckThreshold && !thresholdChecked) {
      await safetyViolations.enforceThreshold(userId);
    }

    throw e;
  }
}

function getThreateningMessage(
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>,
): string | null {
  const lastUserMessage = messages.findLast(
    (message) => message.role === "user",
  );
  if (lastUserMessage) {
    return lastUserMessage.content;
  }

  const lastMessage = messages[messages.length - 1];
  return lastMessage?.content ?? null;
}

function getProviderResponse(
  rawResponse: unknown,
): Prisma.InputJsonValue | undefined {
  return rawResponse as Prisma.InputJsonValue | undefined;
}
