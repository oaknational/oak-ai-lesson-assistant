import { User } from "@clerk/backend";
import { clerkClient } from "@clerk/nextjs/server";
import { default as oakLogger } from "@oakai/logger";
import { Ratelimit } from "@upstash/ratelimit";
import { waitUntil } from "@vercel/functions";

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
  check: (userId: string) => Promise<RateLimitInfo>;
  getRemaining: (userId: string) => Promise<number>;
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

const logger = process.browser ? console : oakLogger;

/**
 * Function to create a user-based rate limiter with a given rate limit
 * @returns A function enforcing user rate limits
 * @example
 * const rateLimiter = userBasedRateLimiter(rateLimits.generations.standard)
 * rateLimiter.check(userId)
 */
export const userBasedRateLimiter = (rateLimit: Ratelimit): RateLimiter => {
  return {
    check: async (userId: string) => {
      if (!userId) {
        throw new Error(
          "authenticated user is required for userBasedRateLimiter",
        );
      }

      if (await isLimitFreeOakUser(userId)) {
        logger.debug("Bypassing rate-limit for oak user %s", userId);
        return { isSubjectToRateLimiting: false };
      }

      const { success, pending, ...rest } = await rateLimit.limit(userId);

      waitUntil(pending);

      if (!success) {
        logger.warn("Rate limit exceeded for user %s", userId);
        throw new RateLimitExceededError(userId, rest.limit, rest.reset);
      }

      return {
        isSubjectToRateLimiting: true,
        ...rest,
      };
    },

    getRemaining: async (userId: string) => {
      return (await rateLimit.getRemaining(userId)).remaining;
    },
  };
};

/**
 * Is the user an oak user, and should we still rate limit them?
 */
async function isLimitFreeOakUser(userId: string): Promise<boolean> {
  const user = await clerkClient.users.getUser(userId);
  return userHasOakEmail(user);
}

function userHasOakEmail(user: User) {
  return user.emailAddresses.some(
    (email) =>
      email.emailAddress.endsWith("@thenational.academy") &&
      !email.emailAddress.includes("rate-limit-me") &&
      !email.emailAddress.includes("demo"),
  );
}
