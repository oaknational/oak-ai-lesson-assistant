import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import { waitUntil } from "@vercel/functions";
import type { z } from "zod";

import { notifyModeration } from "../functions/slack/notifyModeration";
import {
  type NotifyModerationInput,
  notifyModerationSchema,
} from "../functions/slack/notifyModeration.schema";
import { notifyModerationTeachingMaterials } from "../functions/slack/notifyModerationTeachingMaterials";
import {
  type NotifyModerationTeachingMaterialsInput,
  notifyModerationTeachingMaterialsSchema,
} from "../functions/slack/notifyModerationTeachingMaterials.schema";
import { notifyRateLimit } from "../functions/slack/notifyRateLimit";
import {
  type NotifyRateLimitInput,
  notifyRateLimitSchema,
} from "../functions/slack/notifyRateLimit.schema";
import { notifyThreatDetectionAila } from "../functions/slack/notifyThreatDetectionAila";
import {
  type NotifyThreatDetectionAilaInput,
  notifyThreatDetectionAilaSchema,
} from "../functions/slack/notifyThreatDetectionAila.schema";
import { notifyThreatDetectionTeachingMaterials } from "../functions/slack/notifyThreatDetectionTeachingMaterials";
import {
  type NotifyThreatDetectionTeachingMaterialsInput,
  notifyThreatDetectionTeachingMaterialsSchema,
} from "../functions/slack/notifyThreatDetectionTeachingMaterials.schema";
import { notifyUserBan } from "../functions/slack/notifyUserBan";
import {
  type NotifyUserBanInput,
  notifyUserBanSchema,
} from "../functions/slack/notifyUserBan.schema";

const log = aiLogger("core");

function isJestEnvironment() {
  return process.env.JEST_WORKER_ID !== undefined;
}

function captureTaskIssue(
  phase: "execution" | "scheduling",
  taskName: string,
  userId: string | undefined,
  error: unknown,
) {
  const message =
    phase === "execution"
      ? "Background task failed"
      : "Background task scheduling failed";

  log.error(message, {
    taskName,
    userId,
    error,
  });
  Sentry.captureException(
    new Error(`${message} for ${taskName}`, {
      cause: error,
    }),
  );
}

async function runBackgroundTaskSafely(
  taskName: string,
  userId: string,
  task: () => Promise<void>,
) {
  try {
    await task();
  } catch (error) {
    captureTaskIssue("execution", taskName, userId, error);
  }
}

async function scheduleValidatedTask<T extends { user: { id: string } }>(
  taskName: string,
  schema: z.ZodType<T>,
  input: T,
  task: (validatedInput: T) => Promise<void>,
) {
  let userId: string | undefined;

  try {
    const validatedInput = schema.parse(input);
    userId = validatedInput.user.id;
    const scheduledTask = runBackgroundTaskSafely(taskName, userId, () =>
      task(validatedInput),
    );

    log.info("Scheduling background task", {
      taskName,
      userId,
    });

    if (isJestEnvironment()) {
      await scheduledTask;
      return;
    }

    waitUntil(scheduledTask);
    log.info("Scheduled background task", {
      taskName,
      userId,
    });
  } catch (error) {
    captureTaskIssue("scheduling", taskName, userId, error);
  }
}

export async function scheduleModerationNotification(
  notification: NotifyModerationInput,
) {
  await scheduleValidatedTask(
    "slack.notifyModeration",
    notifyModerationSchema,
    notification,
    notifyModeration,
  );
}

export async function scheduleModerationTeachingMaterialsNotification(
  notification: NotifyModerationTeachingMaterialsInput,
) {
  await scheduleValidatedTask(
    "slack.notifyModerationTeachingMaterials",
    notifyModerationTeachingMaterialsSchema,
    notification,
    notifyModerationTeachingMaterials,
  );
}

export async function scheduleRateLimitNotification(
  notification: NotifyRateLimitInput,
) {
  await scheduleValidatedTask(
    "slack.notifyRateLimit",
    notifyRateLimitSchema,
    notification,
    notifyRateLimit,
  );
}

export async function scheduleThreatDetectionAilaNotification(
  notification: NotifyThreatDetectionAilaInput,
) {
  await scheduleValidatedTask(
    "slack.notifyThreatDetectionAila",
    notifyThreatDetectionAilaSchema,
    notification,
    notifyThreatDetectionAila,
  );
}

export async function scheduleThreatDetectionTeachingMaterialsNotification(
  notification: NotifyThreatDetectionTeachingMaterialsInput,
) {
  await scheduleValidatedTask(
    "slack.notifyThreatDetectionTeachingMaterials",
    notifyThreatDetectionTeachingMaterialsSchema,
    notification,
    notifyThreatDetectionTeachingMaterials,
  );
}

export async function scheduleUserBanNotification(
  notification: NotifyUserBanInput,
) {
  await scheduleValidatedTask(
    "slack.notifyUserBan",
    notifyUserBanSchema,
    notification,
    notifyUserBan,
  );
}
