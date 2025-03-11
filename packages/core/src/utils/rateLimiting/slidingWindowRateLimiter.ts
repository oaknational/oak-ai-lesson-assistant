import { aiLogger } from "@oakai/logger";
import { Ratelimit } from "@upstash/ratelimit";
import { waitUntil } from "@vercel/functions";
import { kv } from "@vercel/kv";

import { RateLimitExceededError } from "./errors";
import type { RateLimitDuration, RateLimiter } from "./types";

const log = aiLogger("rate-limiting");

export interface SlidingWindowRateLimiterArgs {
  prefix: string;
  limit: number;
  window: RateLimitDuration;
}

/**
 * Function to create a rate limiter with a given rate limit
 * @returns A function enforcing user rate limits
 * @example
 * const rateLimiter = slidingWindowRateLimiter({
 *   prefix: "rateLimit:myRateLimit",
 *   limit: 100,
 * }),
 * rateLimiter.check(userId)
 */
export const slidingWindowRateLimiter = ({
  prefix,
  limit,
  window,
}: SlidingWindowRateLimiterArgs): RateLimiter => {
  const rateLimiter = new Ratelimit({
    redis: kv,
    prefix,
    limiter: Ratelimit.slidingWindow(limit, window),
  });

  return {
    check: async (userId, options) => {
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
      return (await rateLimiter.getRemaining(userId)).remaining;
    },

    resetUsedTokens: async (userId) => {
      return await rateLimiter.resetUsedTokens(userId);
    },
  };
};
