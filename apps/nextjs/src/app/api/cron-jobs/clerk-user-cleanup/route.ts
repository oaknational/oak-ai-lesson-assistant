import { aiLogger } from "@oakai/logger";

import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/node";
import type { NextRequest } from "next/server";

const log = aiLogger("cron");

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * DAY_IN_MS;
const THREE_MONTHS_MS = 90 * DAY_IN_MS;

const OAK_EMAIL_WITH_NUMBER = /\d.*@thenational\.academy/;

const shouldDeleteUser = (user: User): boolean => {
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    return false;
  }

  const lastActive = new Date(user.lastActiveAt ?? user.createdAt);
  const created = new Date(user.createdAt);
  const now = new Date();

  const timeSinceLastActive = now.getTime() - lastActive.getTime();
  const sameDay = lastActive.toDateString() === created.toDateString();

  const hasTestCharacters =
    email.includes("+") || OAK_EMAIL_WITH_NUMBER.test(email);

  if (hasTestCharacters || sameDay) {
    return timeSinceLastActive > ONE_MONTH_MS;
  }

  return timeSinceLastActive > THREE_MONTHS_MS;
};

async function deleteUser(user: User, isDryRun: boolean): Promise<void> {
  if (isDryRun) {
    log.info(`DRY RUN: Would delete user (ID: ${user.id})`);
    return;
  }

  await clerkClient.users.deleteUser(user.id);
  log.info(`Deleted user (ID: ${user.id})`);
}

async function cleanupUsers(isDryRun: boolean) {
  const result = await clerkClient.users.getUserList({
    limit: 500,
  });

  const usersToDelete = result.data.filter(shouldDeleteUser);

  log.info(
    `Found ${usersToDelete.length} users to delete out of ${result.data.length} total users`,
  );

  if (usersToDelete.length === 0) {
    return {
      deletedCount: 0,
      remainingUsers: result.data.length,
    };
  }

  let deletedCount = 0;

  for (const user of usersToDelete) {
    try {
      await deleteUser(user, isDryRun);
      deletedCount++;
    } catch (e) {
      log.error(`Failed to delete user (ID: ${user.id}):`, e);
    }
  }

  log.info(`Cleanup completed: ${deletedCount} users deleted`);

  return {
    deletedCount,
    remainingUsers: result.data.length - deletedCount,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      log.error("Missing CRON_SECRET environment variable");
      return new Response("Missing cron secret", { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      log.error("Authorization failed. Invalid token.");
      return new Response("Unauthorized", { status: 401 });
    }

    const isDryRun = request.nextUrl.searchParams.get("dry-run") === "true";

    log.info(`Clerk user cleanup cron job started (dry run: ${isDryRun})`);

    const result = await cleanupUsers(isDryRun);

    log.info(
      `Clerk user cleanup completed: ${result.deletedCount} users ${isDryRun ? "would be" : ""} deleted, ${result.remainingUsers} users remaining`,
    );

    return new Response("Clerk user cleanup completed", { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    log.error("Clerk user cleanup cron job failed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
