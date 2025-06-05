import { aiLogger } from "@oakai/logger";

import { type User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { waitUntil } from "@vercel/functions";
import { kv } from "@vercel/kv";
import invariant from "tiny-invariant";

import { isOakEmail } from "../isOakEmail";
import { RateLimitExceededError } from "./errors";
import type { RateLimitDuration, RateLimiter } from "./types";

const log = aiLogger("rate-limiting");

type UserBasedRateLimiterArgs = {
  prefix: string;
  limit: (
    isOakUser: boolean,
    userPrivateMetadata: User["privateMetadata"],
  ) => number;
  refillRate: number;
  interval: RateLimitDuration;
};

/**
 * Create rate limiter with a user-specific rate limit. Refill tokens up to a max limit
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
 *   refillRate: 0.5,
 *   interval: "24 h",
 * }),
 * rateLimiter.check(userId)
 */
export const userBasedRateLimiter = ({
  prefix,
  limit,
  refillRate,
  interval,
}: UserBasedRateLimiterArgs): RateLimiter => {
  invariant(
    refillRate > 0 && refillRate <= 1,
    "refillRate must be between 0 and 1",
  );

  const getRateLimiter = async (userId: string) => {
    invariant(
      userId,
      "authenticated user is required for userBasedRateLimiter",
    );

    const user = await clerkClient.users.getUser(userId);
    const maxTokens = limit(userHasOakEmail(user), user.privateMetadata);
    log.info(
      `TokenBucket: Max tokens: ${maxTokens}, refill rate: ${maxTokens * refillRate}, every ${interval} (${userId})`,
    );

    return new Ratelimit({
      redis: kv,
      prefix,
      limiter: Ratelimit.tokenBucket(
        maxTokens * refillRate,
        interval,
        maxTokens,
      ),
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
        log.info(`Limit exceeded (${userId})`, rest);
        throw new RateLimitExceededError(userId, rest.limit, rest.reset);
      }
      log.info(`Remaining tokens: ${rest.remaining} (${userId})`);

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
      isOakEmail(email.emailAddress) &&
      !email.emailAddress.includes("rate-limit-me") &&
      !email.emailAddress.includes("rate-limited") &&
      !email.emailAddress.includes("demo"),
  );
}
