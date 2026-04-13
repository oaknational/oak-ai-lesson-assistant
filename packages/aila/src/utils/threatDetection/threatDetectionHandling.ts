import { inngest } from "@oakai/core/src/inngest";
import { SafetyViolations as defaultSafetyViolations } from "@oakai/core/src/models/safetyViolations";
import { ThreatDetections as defaultThreatDetections } from "@oakai/core/src/models/threatDetections";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { ThreatDetectionResult } from "@oakai/core/src/threatDetection/types";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { prisma as globalPrisma } from "@oakai/db/client";
import { aiLogger } from "@oakai/logger";

import type { InputJsonValue } from "@prisma/client/runtime/library";
import * as Sentry from "@sentry/nextjs";

import type { AilaThreatDetectionError } from "../../features/threatDetection/types";
import type {
  ActionDocument,
  ErrorDocument,
} from "../../protocol/jsonPatchProtocol";
import { safelyReportAnalyticsEvent } from "../reportAnalyticsEvent";

const log = aiLogger("aila:threat");

function getThreatDetectionOrDefault(
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
    prisma,
  }: {
    userId: string;
    chatId: string;
    error: AilaThreatDetectionError;
    messages?: Array<{
      id?: string;
      role: "system" | "user" | "assistant" | "data";
      content: string;
    }>;
    prisma?: PrismaClientWithAccelerate;
  },
  {
    SafetyViolations = defaultSafetyViolations,
    ThreatDetections = defaultThreatDetections,
  }: {
    SafetyViolations?: typeof defaultSafetyViolations;
    ThreatDetections?: typeof defaultThreatDetections;
  } = {},
): Promise<ErrorDocument | ActionDocument> {
  const prismaClient = prisma ?? globalPrisma;
  const threatDetection = getThreatDetectionOrDefault(error);
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
    const safetyViolations = new SafetyViolations(prismaClient, console);
    const threatDetections = new ThreatDetections(prismaClient);
    const threateningMessage = getThreateningMessage(messages);

    try {
      const safetyViolation = await safetyViolations.createViolation(
        userId,
        "CHAT_MESSAGE",
        "THREAT",
        "CHAT_SESSION",
        chatId,
      );
      error.isSafetyViolationRecorded = true;
      await threatDetections.create({
        appSessionId: chatId,
        messageId: threateningMessage?.id,
        userId,
        threateningMessage:
          threateningMessage?.content ?? threatDetection.message,
        provider: threatDetection.provider,
        category: threatDetection.category,
        severity: threatDetection.severity,
        providerResponse: getProviderResponse(threatDetection.rawResponse),
        safetyViolationId: safetyViolation.id,
      });
      await safetyViolations.enforceThreshold(userId);
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

function getThreateningMessage(
  messages?: Array<{
    id?: string;
    role: "system" | "user" | "assistant" | "data";
    content: string;
  }>,
): { id?: string; content: string } | null {
  const lastUserMessage = messages?.findLast(
    (message) => message.role === "user",
  );
  if (lastUserMessage) {
    return {
      id: lastUserMessage.id,
      content: lastUserMessage.content,
    };
  }

  const lastNonDataMessage = messages?.findLast(
    (message) => message.role !== "data",
  );
  if (lastNonDataMessage) {
    return {
      id: lastNonDataMessage.id,
      content: lastNonDataMessage.content,
    };
  }

  return null;
}

function getProviderResponse(rawResponse: unknown): InputJsonValue | undefined {
  return rawResponse as InputJsonValue | undefined;
}
