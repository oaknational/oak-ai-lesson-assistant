import { aiLogger } from "@oakai/logger";

import type { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { Ratelimit } from "@upstash/ratelimit";
import { waitUntil } from "@vercel/functions";

const log = aiLogger("rate-limiting");

// NOTE: Duplicates RateLimitInfo in packages/api/src/types.ts
export type RateLimitInfo =
  | {
      isSubjectToRateLimiting: false;
    }
  | {
      isSubjectToRateLimiting: true;
      limit: number;
      remaining: number;
      reset: number;
    };

export type RateLimiter = {
  check: (userId: string, options?: { rate: number }) => Promise<RateLimitInfo>;
  getRemaining: (userId: string) => Promise<number>;
  resetUsedTokens: (userId: string) => Promise<void>;
};

export class RateLimitExceededError extends Error {
  public readonly userId: string;
  public readonly limit: number;
  public readonly reset: number;

  constructor(userId: string, limit: number, reset: number) {
    super("Rate limit exceeded");
    this.name = "RateLimitExceededError";
    this.userId = userId;
    this.limit = limit;
    this.reset = reset;
  }
}

/**
 * Function to create a user-based rate limiter with a given rate limit
 * @returns A function enforcing user rate limits
 * @example
 * const rateLimiter = userBasedRateLimiter(rateLimits.generations.standard)
 * rateLimiter.check(userId)
 */
export const userBasedRateLimiter = (rateLimit: Ratelimit): RateLimiter => {
  return {
    check: async (userId, options) => {
      if (!userId) {
        throw new Error(
          "authenticated user is required for userBasedRateLimiter",
        );
      }

      const limitFreeReason = await isLimitFreeUser(userId);
      if (limitFreeReason) {
        log.info(`Bypassing rate-limit for ${limitFreeReason} user ${userId}`);
        return { isSubjectToRateLimiting: false };
      }

      const { success, pending, ...rest } = await rateLimit.limit(
        userId,
        options,
      );

      waitUntil(pending);

      if (!success) {
        log.info("Rate limit exceeded for user %s", userId, rest);
        throw new RateLimitExceededError(userId, rest.limit, rest.reset);
      }

      return {
        isSubjectToRateLimiting: true,
        ...rest,
      };
    },

    getRemaining: async (userId) => {
      return (await rateLimit.getRemaining(userId)).remaining;
    },

    resetUsedTokens: async (userId) => {
      return await rateLimit.resetUsedTokens(userId);
    },
  };
};

async function isLimitFreeUser(
  userId: string,
): Promise<"oak" | "metadata" | null> {
  const user = await clerkClient.users.getUser(userId);
  if (userHasOakEmail(user)) {
    return "oak";
  }
  if (userHasHigherLimitMetadata(user)) {
    return "metadata";
  }
  return null;
}

/**
 * Is the user an oak user, and should we still rate limit them?
 */
function userHasOakEmail(user: User) {
  return user.emailAddresses.some(
    (email) =>
      email.emailAddress.endsWith("@thenational.academy") &&
      !email.emailAddress.includes("rate-limit-me") &&
      !email.emailAddress.includes("rate-limited") &&
      !email.emailAddress.includes("demo"),
  );
}

/**
 * Does the user have hasHigherLimits metadata?
 */
function userHasHigherLimitMetadata(user: User) {
  return user.privateMetadata.hasHigherLimits === true;
}
