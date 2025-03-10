import { SafetyViolations as defaultSafetyViolations } from "@oakai/core/src/models/safetyViolations";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { AilaThreatDetectionError } from "../../features/threatDetection/types";
import type {
  ActionDocument,
  ErrorDocument,
} from "../../protocol/jsonPatchProtocol";
import { safelyReportAnalyticsEvent } from "../reportAnalyticsEvent";

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
  await safelyReportAnalyticsEvent({
    eventName: "helicone_threat_detected",
    userId,
    payload: {
      chat_id: chatId,
      error,
    },
  });

  const safetyViolations = new SafetyViolations(prisma, console);
  try {
    await safetyViolations.recordViolation(
      userId,
      "CHAT_MESSAGE",
      "HELICONE",
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

  return {
    type: "error",
    value: "Threat detected",
    message:
      "I wasn’t able to process your request because a potentially malicious input was detected.",
  };
}
