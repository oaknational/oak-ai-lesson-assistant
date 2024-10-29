import type { SignedInAuthObject } from "@clerk/backend/internal";
import { clerkClient } from "@clerk/nextjs/server";
import { aiLogger } from "@oakai/logger";
import { TRPCError } from "@trpc/server";

import { t } from "../trpc";

const log = aiLogger("auth");

/**
 * Currently this is (1) an expensive check that makes a round trip to Clerk,
 * and (2) a naive check that checks email domain matches Oak's.
 * We might want to move to having a role in the Metadata, or at least consider
 * other approaches longer term.
 */
const isAdminMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    log.info({ auth: ctx.auth, url: ctx.req.url }, `User not an admin`);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not an admin",
    });
  }

  const user = await clerkClient.users.getUser(ctx.auth.userId);

  if (
    !user.emailAddresses.some((email) =>
      email.emailAddress.endsWith("@thenational.academy"),
    )
  ) {
    log.info({ auth: ctx.auth, url: ctx.req.url }, `User not an admin`);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not an admin",
    });
  }

  return next({
    ctx: {
      auth: ctx.auth as SignedInAuthObject,
    },
  });
});
export const adminProcedure = t.procedure.use(isAdminMiddleware);
