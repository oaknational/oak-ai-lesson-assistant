import { inngest } from "@oakai/core/src/inngest";
import { rateLimits } from "@oakai/core/src/utils/rateLimiting";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";
import type { RateLimiter } from "@oakai/core/src/utils/rateLimiting/types";

import { TRPCError } from "@trpc/server";

import { t } from "../trpc";
import { isAuthedMiddleware } from "./auth";

/**
 * Adapter to use userBasedRateLimiter as tRPC middleware
 *
 * Returns a tRPC middleware
 * @example
 *  procedure.use(createRateLimiterMiddleware(..))
 */
function createRateLimiterMiddleware(rateLimiter: RateLimiter) {
  return t.middleware(async (opts) => {
    const userId = opts.ctx.auth.userId;
    if (typeof userId !== "string") {
      throw new Error(
        "rateLimiterMiddleware called with an unauthenticated user, ensure auth middleware is applied first",
      );
    }

    try {
      const limitInfo = await rateLimiter.check(userId);

      // Pass along the {limit, remaining, reset} info for use in the request
      return opts.next({
        ctx: {
          rateLimit: limitInfo,
        },
      });
    } catch (e) {
      if (e instanceof RateLimitExceededError) {
        await inngest.send({
          name: "app/slack.notifyRateLimit",
          user: {
            id: userId,
          },
          data: {
            limit: e.limit,
            reset: new Date(e.reset),
          },
        });
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests, please try again later.",
          cause: e,
        });
      }
      throw e;
    }
  });
}

const rateLimiter = rateLimits.generations.standard;

export const userBasedRateLimitProcedure = t.procedure
  .use(isAuthedMiddleware)
  .use(createRateLimiterMiddleware(rateLimiter));
