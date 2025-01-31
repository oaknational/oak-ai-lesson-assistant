"use client";

import type { ChatAppRouter } from "@oakai/api/src/router/chat";
import { transformer } from "@oakai/api/transformer";
import { loggerLink, createTRPCProxyClient } from "@trpc/client";

import { discriminatingRouterLink } from "./trpc";

export const trpcClient = createTRPCProxyClient<ChatAppRouter>({
  transformer,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    discriminatingRouterLink,
  ],
});
