import { createContext } from "@oakai/api/src/context";
import { oakAppRouter } from "@oakai/api/src/router";
import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest, NextResponse } from "next/server";

import { withSentry } from "@/lib/sentry/withSentry";

const log = aiLogger("trpc");

const handler = (req: NextRequest, res: NextResponse) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/main",
    req,
    router: oakAppRouter,
    createContext: () => {
      return createContext({ req, res });
    },
    onError: (e) => {
      if (process.env.NODE_ENV === "development") {
        log.error(e);
      }
      Sentry.captureException(e.error);
    },
  });

const wrappedHandler = withSentry(handler);

export { wrappedHandler as GET, wrappedHandler as POST };
