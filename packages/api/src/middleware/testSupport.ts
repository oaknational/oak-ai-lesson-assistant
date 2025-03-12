import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";

import { publicProcedure, t } from "../trpc";

const log = aiLogger("testing");

/**
 * Middleware to limit test support routes to testable environments like Vercel previews
 */
const isTestMiddleware = t.middleware(async ({ next, ctx }) => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === "preview"
  ) {
    return next({
      ctx: {
        ...ctx,
        auth: {
          userId: "testSupport",
        },
      },
    });
  }

  log.error("testSupport: Not in a testable environment");
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "Not authenticated",
  });
});

export const testSupportMiddleware = publicProcedure.use(isTestMiddleware);
