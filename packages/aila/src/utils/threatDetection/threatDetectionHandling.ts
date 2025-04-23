import { SafetyViolations as defaultSafetyViolations } from "@oakai/core/src/models/safetyViolations";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { AilaThreatDetectionError } from "../../features/threatDetection/types";
import type {
  ActionDocument,
  ErrorDocument,
} from "../../protocol/jsonPatchProtocol";
import { safelyReportAnalyticsEvent } from "../reportAnalyticsEvent";

const log = aiLogger("aila:threat");

export async function handleThreatDetectionError(
  {
    userId,
    chatId,
    error,
    prisma,
  }: {
    userId: string;
    chatId: string;
    error: AilaThreatDetectionError;
    prisma: PrismaClientWithAccelerate;
  },
  SafetyViolations = defaultSafetyViolations,
): Promise<ErrorDocument | ActionDocument> {
  if (!error.isAnalyticsEventReported) {
    await safelyReportAnalyticsEvent({
      eventName: "threat_detected",
      userId,
      payload: {
        chat_id: chatId,
        error,
      },
    });

    error.isAnalyticsEventReported = true;
  } else {
    log.info(
      "Skipping reporting analytics event, already reported. This may be a sign that `handleThreatDetectionError is being called redundantly",
    );
  }

  if (!error.isSafetyViolationRecorded) {
    const safetyViolations = new SafetyViolations(prisma, console);
    try {
      await safetyViolations.recordViolation(
        userId,
        "CHAT_MESSAGE",
        "THREAT",
        "CHAT_SESSION",
        chatId,
      );
    } catch (e) {
      if (e instanceof UserBannedError) {
        return {
          type: "action",
          action: "SHOW_ACCOUNT_LOCKED",
        };
      }
      throw e;
    }
  } else {
    log.info(
      "Skipping recording safety violation, already recorded. This may be a sign that `handleThreatDetectionError is being called redundantly",
    );
  }

  return {
    type: "error",
    value: "Threat detected",
    message:
      "I wasn't able to process your request because a potentially malicious input was detected.",
  };
}
