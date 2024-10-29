import type { SignedInAuthObject } from "@clerk/backend/internal";
import { aiLogger } from "@oakai/logger";
import { TRPCError } from "@trpc/server";

import { t } from "../trpc";
import { applyApiKeyMiddleware } from "./apiKeyAuth";

const log = aiLogger("auth");

export const isLoggedInMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    log.info({ auth: ctx.auth, url: ctx.req.url }, `User not authenticated`);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      auth: ctx.auth as SignedInAuthObject,
    },
  });
});

// Both Clerk and API key auth set ctx.auth.userId. API key takes precedence
// On unstable_pipe: https://trpc.io/docs/server/middlewares#extending-middlewares
export const isAuthedMiddleware =
  applyApiKeyMiddleware.unstable_pipe(isLoggedInMiddleware);

export const protectedProcedure = t.procedure.use(isAuthedMiddleware);
