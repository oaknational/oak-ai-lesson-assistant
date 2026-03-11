import type {
  AilaPlugin,
  AilaPluginContext,
} from "@oakai/aila/src/core/plugins";
import { AilaThreatDetectionError } from "@oakai/aila/src/features/threatDetection";
import { handleThreatDetectionError } from "@oakai/aila/src/utils/threatDetection/threatDetectionHandling";
import { inngest } from "@oakai/core/src/inngest";
import { SafetyViolations as defaultSafetyViolations } from "@oakai/core/src/models/safetyViolations";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import { waitUntil } from "@vercel/functions";

const log = aiLogger("chat");

type PluginCreator = (
  prisma: PrismaClientWithAccelerate,
  SafetyViolations?: typeof defaultSafetyViolations,
) => AilaPlugin;

export const createWebActionsPlugin: PluginCreator = (
  prisma,
  SafetyViolations = defaultSafetyViolations,
) => {
  const onStreamError: AilaPlugin["onStreamError"] = async (
    error,
    { aila, enqueue },
  ) => {
    if (error instanceof AilaThreatDetectionError) {
      // #TODO change this to handleThreatDetectionError and move
      // the logic elsewhere. Stop passing Prisma
      const threatError = await handleThreatDetectionError(
        {
          userId: aila.userId ?? "anonymous", // This should never be "anonymous" because we would get an authentication error
          chatId: aila.chatId ?? "unknown",
          error,
          messages: aila.messages,
          prisma,
        },
        SafetyViolations,
      );
      await enqueue(threatError);
    }

    if (error instanceof Error) {
      await enqueue({
        type: "error",
        message: error.message,
        value: `Sorry, an error occurred: ${error.message}`,
      });
    }

    throw error;
  };

  const sendModerationSlackNotification = async (
    moderation: Parameters<NonNullable<AilaPlugin["onToxicModeration"]>>[0],
    aila: AilaPluginContext["aila"],
    safetyLevel: "toxic" | "highly-sensitive",
  ) => {
    const { userId } = aila;
    if (!userId) {
      throw new Error("User ID not set");
    }

    try {
      log.info("Sending slack notification for moderation");
      await inngest.send({
        name: "app/slack.notifyModeration",
        user: { id: userId },
        data: {
          chatId: aila.chatId || "Unknown",
          categories: moderation.categories as string[],
          justification: moderation.justification ?? "Unknown",
          safetyLevel,
        },
      });
    } catch (e) {
      log.error("Error scheduling slack notification", e);
      Sentry.captureException(e);
    }
  };

  const onToxicModeration: AilaPlugin["onToxicModeration"] = async (
    moderation,
    { aila, enqueue },
  ) => {
    await sendModerationSlackNotification(moderation, aila, "toxic");

    try {
      const safetyViolations = new SafetyViolations(prisma);
      await safetyViolations.recordViolation(
        aila.userId!,
        "CHAT_MESSAGE",
        "MODERATION",
        "MODERATION",
        moderation.id,
      );
    } catch (error) {
      if (error instanceof UserBannedError) {
        log.info("User is banned, queueing account lock message");
        await enqueue({
          type: "action",
          action: "SHOW_ACCOUNT_LOCKED",
        });
      } else {
        throw error;
      }
    }
  };

  const onHighlySensitiveModeration: AilaPlugin["onHighlySensitiveModeration"] =
    async (moderation, { aila }) => {
      await sendModerationSlackNotification(
        moderation,
        aila,
        "highly-sensitive",
      );
    };

  const onBackgroundWork: AilaPlugin["onBackgroundWork"] = (promise) => {
    waitUntil(promise);
  };

  return {
    onStreamError,
    onToxicModeration,
    onHighlySensitiveModeration,
    onBackgroundWork,
  };
};
