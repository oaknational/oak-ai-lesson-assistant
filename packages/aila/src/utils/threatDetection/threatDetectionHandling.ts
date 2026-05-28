import { scheduleThreatDetectionAilaNotification } from "@oakai/core/src/backgroundTasks";
import { SafetyViolations as defaultSafetyViolations } from "@oakai/core/src/models/safetyViolations";
import { ThreatDetections as defaultThreatDetections } from "@oakai/core/src/models/threatDetections";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "@oakai/core/src/threatDetection/types";
import type { Prisma, PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type {
  ActionDocument,
  ErrorDocument,
} from "../../protocol/jsonPatchProtocol";
import { safelyReportAnalyticsEvent } from "../reportAnalyticsEvent";

const log = aiLogger("aila:threat");

type ThreatDetectionHandlingDeps = {
  SafetyViolations?: typeof defaultSafetyViolations;
  ThreatDetections?: typeof defaultThreatDetections;
};

const SHOW_ACCOUNT_LOCKED: ActionDocument = {
  type: "action",
  action: "SHOW_ACCOUNT_LOCKED",
};

export async function handleThreatDetectionResult(
  {
    userId,
    chatId,
    threatDetection,
    messages,
    prisma,
  }: {
    userId: string;
    chatId: string;
    threatDetection: ThreatDetectionResult;
    messages?: ThreatDetectionMessage[];
    prisma: PrismaClientWithAccelerate;
  },
  {
    SafetyViolations = defaultSafetyViolations,
    ThreatDetections = defaultThreatDetections,
  }: ThreatDetectionHandlingDeps = {},
): Promise<ErrorDocument | ActionDocument> {
  await safelyReportAnalyticsEvent({
    eventName: "threat_detected",
    userId,
    payload: {
      chat_id: chatId,
      threatDetection,
    },
  });

  try {
    const userMessages = (messages ?? [])
      .filter((msg) => msg.role === "user")
      .map((msg) => ({
        role: "user" as const,
        content: msg.content,
      }));

    await scheduleThreatDetectionAilaNotification({
      user: {
        id: userId,
      },
      data: {
        chatId,
        userAction: "CHAT_SESSION",
        threatDetection,
        messages: userMessages,
      },
    });
  } catch (e) {
    log.error("Failed to schedule threat detection notification", { error: e });
  }

  const action = await recordThreatDetectionSafetyViolation({
    userId,
    chatId,
    messages,
    prisma,
    threatDetection,
    SafetyViolations,
    ThreatDetections,
  });

  if (action) {
    return action;
  }

  return {
    type: "error",
    value: "Threat detected",
    message:
      "I wasn't able to process your request because a potentially malicious input was detected.",
  };
}

function getThreateningMessage(
  messages?: ThreatDetectionMessage[],
): { id?: string; content: string } | null {
  const lastUserMessage = messages?.findLast((m) => m.role === "user");
  if (lastUserMessage) {
    return { id: lastUserMessage.id, content: lastUserMessage.content };
  }

  const lastMessage = messages?.at(-1);
  if (lastMessage) {
    return { id: lastMessage.id, content: lastMessage.content };
  }

  return null;
}

function getProviderResponse(
  rawResponse: unknown,
): Prisma.InputJsonValue | undefined {
  return rawResponse as Prisma.InputJsonValue | undefined;
}

async function recordThreatDetectionSafetyViolation({
  userId,
  chatId,
  messages,
  prisma,
  threatDetection,
  SafetyViolations,
  ThreatDetections,
}: {
  userId: string;
  chatId: string;
  messages?: ThreatDetectionMessage[];
  prisma: PrismaClientWithAccelerate;
  threatDetection: ThreatDetectionResult;
  SafetyViolations: typeof defaultSafetyViolations;
  ThreatDetections: typeof defaultThreatDetections;
}): Promise<ActionDocument | null> {
  const safetyViolations = new SafetyViolations(prisma);
  const threatDetections = new ThreatDetections(prisma);
  const threateningMessage = getThreateningMessage(messages);
  let shouldCheckThreshold = false;
  let thresholdChecked = false;

  try {
    const safetyViolation = await safetyViolations.createViolation(
      userId,
      "CHAT_MESSAGE",
      "THREAT",
      "CHAT_SESSION",
      chatId,
    );
    shouldCheckThreshold = true;

    await threatDetections.create({
      appSessionId: chatId,
      recordType: "CHAT_SESSION",
      recordId: chatId,
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
    thresholdChecked = true;
  } catch (e) {
    if (e instanceof UserBannedError) {
      return SHOW_ACCOUNT_LOCKED;
    }

    if (shouldCheckThreshold && !thresholdChecked) {
      try {
        await safetyViolations.enforceThreshold(userId);
      } catch (thresholdError) {
        if (thresholdError instanceof UserBannedError) {
          return SHOW_ACCOUNT_LOCKED;
        }

        throw thresholdError;
      }
    }

    throw e;
  }

  return null;
}
