import { inngest } from "@oakai/core/src/inngest";
import { SafetyViolations as defaultSafetyViolations } from "@oakai/core/src/models/safetyViolations";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { ThreatDetectionResult } from "@oakai/core/src/threatDetection/types";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import type { AilaThreatDetectionError } from "../../features/threatDetection/types";
import type {
  ActionDocument,
  ErrorDocument,
} from "../../protocol/jsonPatchProtocol";
import { safelyReportAnalyticsEvent } from "../reportAnalyticsEvent";

const log = aiLogger("aila:threat");

function buildFallbackThreatDetection(
  error: AilaThreatDetectionError,
): ThreatDetectionResult {
  if (error.threatDetection) {
    return error.threatDetection;
  }

  return {
    provider: "unknown",
    isThreat: true,
    severity: "high",
    category: "other",
    message: error.message || "Potential threat detected",
    rawResponse: undefined,
    findings: [
      {
        category: "other",
        severity: "high",
        providerCode: "unknown",
        detected: true,
      },
    ],
  };
}

export async function handleThreatDetectionError(
  {
    userId,
    chatId,
    error,
    messages,
    prisma = globalPrisma,
  }: {
    userId: string;
    chatId: string;
    error: AilaThreatDetectionError;
    messages?: Array<{
      role: "system" | "user" | "assistant" | "data";
      content: string;
    }>;
    prisma?: PrismaClientWithAccelerate;
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

  try {
    log.info("Sending slack notification for threat detection", {
      userId,
      chatId,
    });

    const threatDetection = buildFallbackThreatDetection(error);

    const userMessages = (messages ?? [])
      .filter((msg) => msg.role === "user")
      .map((msg) => ({
        role: "user" as const,
        content: msg.content,
      }));

    const eventPayload = {
      name: "app/slack.notifyThreatDetectionAila" as const,
      user: {
        id: userId,
      },
      data: {
        chatId,
        userAction: "CHAT_SESSION",
        threatDetection,
        messages: userMessages,
      },
    };

    log.info("Sending Inngest event", {
      eventName: eventPayload.name,
      userId,
      chatId,
      messageCount: userMessages.length,
      threatDataProvider: threatDetection.provider,
    });

    await inngest.send(eventPayload);

    log.info("Successfully sent Inngest event", {
      eventName: eventPayload.name,
      userId,
      chatId,
    });
  } catch (e) {
    log.error("Error scheduling slack notification", e);
    Sentry.captureException(e);
    // NOTE: don't throw as it will prevent threat detection from being handled
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
