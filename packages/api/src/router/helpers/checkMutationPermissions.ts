import { demoUsers } from "@oakai/core";
import { rateLimits } from "@oakai/core/src/utils/rateLimiting";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/errors";

import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

export async function checkMutationPermissions(userId: string) {
  const clerkUser = await clerkClient.users.getUser(userId);
  if (clerkUser.banned) {
    throw new Error("User is banned");
  }

  if (demoUsers.isDemoUser(clerkUser)) {
    try {
      await rateLimits.appSessions.demo.check(userId);
    } catch (e) {
      if (e instanceof RateLimitExceededError) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded",
          cause: e,
        });
      }
      throw e;
    }
  }
}
