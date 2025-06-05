import { aiLogger } from "@oakai/logger";

import { Ratelimit } from "@upstash/ratelimit";
import { waitUntil } from "@vercel/functions";
import { kv } from "@vercel/kv";

import { RateLimitExceededError } from "./errors";
import type { RateLimitDuration, RateLimiter } from "./types";

const log = aiLogger("rate-limiting");

export interface FixedWindowRateLimiterArgs {
  prefix: string;
  limit: number;
  window: RateLimitDuration;
}

/**
 * Create a rate limiter with a given limit that resets on a fixed window
 * @returns A function enforcing user rate limits
 * @example
 * const rateLimiter = fixedWindowRateLimiter({
 *   prefix: "rateLimit:myRateLimit",
 *   limit: 100,
 *   window: "30 d",
 * }),
 * rateLimiter.check(userId)
 */
export const fixedWindowRateLimiter = ({
  prefix,
  limit,
  window,
}: FixedWindowRateLimiterArgs): RateLimiter => {
  const rateLimiter = new Ratelimit({
    redis: kv,
    prefix,
    limiter: Ratelimit.fixedWindow(limit, window),
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