import { aiLogger } from "@oakai/logger";

import { type User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { waitUntil } from "@vercel/functions";
import { kv } from "@vercel/kv";

import { RateLimitExceededError } from "./errors";
import type { RateLimitDuration, RateLimiter } from "./types";

const log = aiLogger("rate-limiting");

type UserBasedRateLimiterArgs = {
  prefix: string;
  limit: (
    isOakUser: boolean,
    userPrivateMetadata: User["privateMetadata"],
  ) => number;
  window: RateLimitDuration;
};

/**
 * Function to create a user-based rate limiter with a user-specific rate limit
 * @returns A function enforcing user rate limits
 * @example
 * const rateLimiter = userBasedRateLimiter({
 *   prefix: "rateLimit:myRateLimit",
 *   limit: (isOakUser, privateMetadata) => {
 *     if (isOakUser) {
 *       return 1000;
 *     }
 *     return 100
 *   },
 *   window: "24 h",
 * }),
 * rateLimiter.check(userId)
 */
export const userBasedRateLimiter = ({
  prefix,
  limit,
  window,
}: UserBasedRateLimiterArgs): RateLimiter => {
  const getRateLimiter = async (userId: string) => {
    if (!userId) {
      throw new Error(
        "authenticated user is required for userBasedRateLimiter",
      );
    }

    const user = await clerkClient.users.getUser(userId);

    const tokenLimit = limit(userHasOakEmail(user), user.privateMetadata);
    log.info(`Using limit ${tokenLimit} for user ${userId}`);

    return new Ratelimit({
      redis: kv,
      prefix,
      limiter: Ratelimit.slidingWindow(tokenLimit, window),
    });
  };

  return {
    check: async (userId, options) => {
      const rateLimiter = await getRateLimiter(userId);
      const { success, pending, ...rest } = await rateLimiter.limit(
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
      const rateLimiter = await getRateLimiter(userId);
      return (await rateLimiter.getRemaining(userId)).remaining;
    },

    resetUsedTokens: async (userId) => {
      const rateLimiter = await getRateLimiter(userId);
      return await rateLimiter.resetUsedTokens(userId);
    },
  };
};

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
