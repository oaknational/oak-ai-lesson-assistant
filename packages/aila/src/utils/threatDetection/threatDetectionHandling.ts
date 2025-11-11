import { inngest } from "@oakai/core/src/inngest";
import { SafetyViolations as defaultSafetyViolations } from "@oakai/core/src/models/safetyViolations";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import { lakeraGuardResponseSchema } from "@oakai/core/src/threatDetection/lakera";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import { threatDetectionResultSchema } from "../../features/threatDetection/detectors/AilaThreatDetector";
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

    const parsedThreatData = threatDetectionResultSchema.safeParse(error.cause);
    const parsedRawThreatData = lakeraGuardResponseSchema.safeParse(
      parsedThreatData.data?.rawResponse,
    );

    if (!parsedRawThreatData.success) {
      log.warn("Failed to parse Lakera threat detection data, using fallback", {
        error: parsedRawThreatData.error,
        rawData: parsedThreatData.data?.rawResponse,
      });
    }

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
        threatDetection: parsedRawThreatData.success
          ? parsedRawThreatData.data
          : { flagged: true },
        messages: userMessages,
      },
    };

    log.info("Sending Inngest event", {
      eventName: eventPayload.name,
      userId,
      chatId,
      messageCount: userMessages.length,
      threatDataSuccess: parsedRawThreatData.success,
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
