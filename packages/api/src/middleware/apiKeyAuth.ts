import { TRPCError } from "@trpc/server";

import { APIKeyAuthObject } from "../context";
import { t } from "../trpc";

const OAI_INTERNAL_API_KEY = process.env.OAI_INTERNAL_API_KEY;
const OAI_API_USER_ID = process.env.OAI_API_USER_ID;

if (!OAI_INTERNAL_API_KEY) {
  throw new Error("Missing env var OAI_INTERNAL_API_KEY");
}
if (!OAI_API_USER_ID) {
  throw new Error("Missing env var OAI_API_USER_ID");
}

export const applyApiKeyMiddleware = t.middleware(async ({ next, ctx }) => {
  const headerApiKey = ctx.req.headers.get("x-oai-api-key");

  if (headerApiKey === OAI_INTERNAL_API_KEY) {
    return next({
      ctx: {
        auth: { userId: OAI_API_USER_ID } as APIKeyAuthObject,
      },
    });
  }

  return next();
});

export const requireApiKeyMiddleware = t.middleware(async ({ next, ctx }) => {
  const headerApiKey = ctx.req.headers.get("x-oai-api-key");
  if (headerApiKey !== OAI_INTERNAL_API_KEY) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or missing API key",
    });
  }

  return next({
    ctx: {
      auth: { userId: OAI_API_USER_ID } as APIKeyAuthObject,
    },
  });
});

export const apiKeyProtectedProcedure = t.procedure.use(
  requireApiKeyMiddleware,
);
