"use client";

import { useState } from "react";

import { type AppRouter } from "@oakai/api/src/router";
import { type ChatAppRouter } from "@oakai/api/src/router/chat";
import { transformer } from "@oakai/api/transformer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TRPCLink} from "@trpc/client";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs } from "@trpc/server";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 2525}`; // dev SSR should use localhost
};

type CombinedRouter = AppRouter & ChatAppRouter;

const trpc = createTRPCReact<CombinedRouter>();

const discriminatingRouterLink: TRPCLink<CombinedRouter> = (runtime) => {
  const headers = () => ({
    "x-trpc-source": "react",
  });

  const servers = {
    main: httpBatchLink({
      url: `${getBaseUrl()}/api/trpc/main`,
      headers,
    })(runtime),
    chat: httpBatchLink({
      url: `${getBaseUrl()}/api/trpc/chat`,
      headers,
    })(runtime),
  };

  return (ctx) => {
    const { op } = ctx;
    const routerName = op.path.split(".")[0];

    const link = routerName === "chat" ? servers["chat"] : servers["main"];

    return link(ctx);
  };
};

export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer,
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        discriminatingRouterLink,
      ],
    }),
  );

  return (
    <trpc.Provider queryClient={queryClient} client={trpcClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export type RouterInputs = inferRouterInputs<AppRouter>;

export { trpc };
