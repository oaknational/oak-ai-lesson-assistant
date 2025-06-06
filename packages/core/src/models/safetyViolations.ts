import type {
  PrismaClientWithAccelerate,
  SafetyViolationAction,
  SafetyViolationRecordType,
  SafetyViolationSource,
} from "@oakai/db";
import type { StructuredLogger } from "@oakai/logger";
import { structuredLogger } from "@oakai/logger";

import { clerkClient } from "@clerk/nextjs/server";
import type { Logger as InngestLogger } from "inngest/middleware/logger";

import { posthogAiBetaServerClient } from "../analytics/posthogAiBetaServerClient";
import { inngest } from "../inngest";
import { UserBannedError } from "./userBannedError";

const ALLOWED_VIOLATIONS = parseInt(
  process.env.SAFETY_VIOLATIONS_MAX_ALLOWED ?? "5",
  10,
);
const CHECK_WINDOW_DAYS = parseInt(
  process.env.SAFETY_VIOLATION_WINDOW_DAYS ?? "30",
  10,
);
const checkWindowMs = 1000 * 60 * 60 * 24 * CHECK_WINDOW_DAYS;

/**
 * SafetyViolations records safety violations and bans users who exceed the
 * allowed number of violations in a given time window.
 * The source of truth for user data is Clerk, so we don't record the ban in
 * Prisma.
 * However, if we lift a ban it does not reset the violation count, so it's
 * possible for a user to be banned again immediately after being unbanned if
 * they trigger another violation.
 */
export class SafetyViolations {
  constructor(
    private readonly prisma: PrismaClientWithAccelerate,
    // inngest's logger doesn't allow child logger creation, so make
    // sure we accept instances of that too
    private readonly logger:
      | StructuredLogger
      | InngestLogger = structuredLogger,
  ) {}

  async recordViolation(
    userId: string,
    userAction: SafetyViolationAction,
    detectionSource: SafetyViolationSource,
    recordType: SafetyViolationRecordType,
    recordId: string,
  ): Promise<void> {
    this.logger.info(`Recording safety violation for user ${userId}`);
    await this.prisma.safetyViolation.create({
      data: {
        userId,
        userAction,
        detectionSource,
        recordType,
        recordId,
      },
    });

    posthogAiBetaServerClient.capture({
      distinctId: userId,
      event: "Safety Violation",
      properties: {
        userAction,
        detectionSource,
        recordType,
        recordId,
      },
    });

    const shouldBanUser = await this.isOverThreshold(userId);
    if (shouldBanUser) {
      const isSafetyTester = await posthogAiBetaServerClient.isFeatureEnabled(
        "safety-testing",
        userId,
      );
      if (isSafetyTester) {
        this.logger.info(
          `Not banning user ${userId} as they are a safety tester`,
        );
        return;
      }

      await this.banUser(userId);
      throw new UserBannedError(userId);
    }
  }

  async isOverThreshold(userId: string): Promise<boolean> {
    const recentViolationsCount = await this.prisma.safetyViolation.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - checkWindowMs),
        },
      },
    });
    return recentViolationsCount > ALLOWED_VIOLATIONS;
  }

  async banUser(userId: string): Promise<void> {
    this.logger.info(`Banning user ${userId}`);
    // NOTE: Clerk is the source of truth for user data, so we don't record the ban in prisma
    await clerkClient.users.banUser(userId);

    posthogAiBetaServerClient.capture({
      distinctId: userId,
      event: "User Banned",
    });
    posthogAiBetaServerClient.identify({
      distinctId: userId,
      properties: { banned: true },
    });
    await posthogAiBetaServerClient.flush();
    await inngest.send({
      name: "app/slack.notifyUserBan",
      user: { id: userId },
      data: {},
    });
  }

  async removeViolationById(id: string): Promise<void> {
    const safetyViolation = await this.prisma.safetyViolation.findUnique({
      where: {
        id,
      },
    });
    if (!safetyViolation) {
      this.logger.info(`No safety violation found for id ${id}`);
      return;
    }
    const { userId } = safetyViolation;
    await this.prisma.safetyViolation.delete({
      where: {
        id,
      },
    });
    await this.conditionallyUnbanUser(userId);
  }
  /**
   * Removes all safety violations associated with a recordId.
   * If the user is under the threshold after removing the violations,
   * the user is unbanned.
   * @param recordId The recordId to remove violations for
   */

  async removeViolationsByRecordId(recordId: string): Promise<void> {
    const safetyViolations = await this.prisma.safetyViolation.findMany({
      where: {
        recordId,
      },
    });

    await this.prisma.safetyViolation.deleteMany({
      where: {
        recordId,
      },
    });

    await Promise.all(
      /**
       * With our current API, there will be maximum 1 safety violation per record,
       * but this pattern future-proofs in case a record is cached and so associated
       * with multiple users/violations.
       */
      safetyViolations.map(async (violation) => {
        const { userId } = violation;
        await this.conditionallyUnbanUser(userId);
      }),
    );
  }

  async conditionallyUnbanUser(userId: string): Promise<void> {
    const isUnderThreshold = !(await this.isOverThreshold(userId));
    if (!isUnderThreshold) {
      return;
    }
    const user = await clerkClient.users.getUser(userId);

    if (user.banned) {
      this.logger.info(`Unbanning user ${userId}`);
      await clerkClient.users.unbanUser(userId);

      posthogAiBetaServerClient.capture({
        distinctId: userId,
        event: "User Unbanned",
      });
      posthogAiBetaServerClient.identify({
        distinctId: userId,
        properties: { banned: false },
      });
      await posthogAiBetaServerClient.flush();
    }
  }
}
