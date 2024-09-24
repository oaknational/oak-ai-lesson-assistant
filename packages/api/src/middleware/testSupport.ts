import logger from "@oakai/logger";
import { TRPCError } from "@trpc/server";

import { publicProcedure, t } from "../trpc";

/**
 * Middleware to limit test support routes to testable environments like Vercel previews
 */
const isTestMiddleware = t.middleware(async ({ next, ctx }) => {
  console.log("testSupportMiddleware");
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

  logger.error("testSupport: Not in a testable environment");
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "Not authenticated",
  });
});

export const testSupportMiddleware = publicProcedure.use(isTestMiddleware);
// export const testSupportMiddleware = t.procedure.use(isTestMiddleware);
