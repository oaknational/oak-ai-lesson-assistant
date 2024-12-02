import type { AilaPlugin } from "@oakai/aila/src/core/plugins";
import { AilaThreatDetectionError } from "@oakai/aila/src/features/threatDetection";
import { handleHeliconeError } from "@oakai/aila/src/utils/moderation/moderationErrorHandling";
import { inngest } from "@oakai/core/src/inngest";
import { SafetyViolations as defaultSafetyViolations } from "@oakai/core/src/models/safetyViolations";
import { UserBannedError } from "@oakai/core/src/models/userBannedError";
import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
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
      const heliconeErrorMessage = await handleHeliconeError(
        aila.userId ?? "anonymous", // This should never be "anonymous" because we would get an authentication error
        aila.chatId ?? "unknown",
        error,
        prisma,
        SafetyViolations,
      );
      await enqueue(heliconeErrorMessage);
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

  const onToxicModeration: AilaPlugin["onToxicModeration"] = async (
    moderation,
    { aila, enqueue },
  ) => {
    const { userId } = aila;
    if (!userId) {
      throw new Error("User ID not set");
    }

    await inngest.send({
      name: "app/slack.notifyModeration",
      user: {
        id: userId,
      },
      data: {
        chatId: aila.chatId || "Unknown",
        categories: moderation.categories as string[],
        justification: moderation.justification ?? "Unknown",
      },
    });

    try {
      const safetyViolations = new SafetyViolations(prisma);
      await safetyViolations.recordViolation(
        userId,
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

  const onBackgroundWork: AilaPlugin["onBackgroundWork"] = (promise) => {
    waitUntil(promise);
  };

  return {
    onStreamError,
    onToxicModeration,
    onBackgroundWork,
  };
};
