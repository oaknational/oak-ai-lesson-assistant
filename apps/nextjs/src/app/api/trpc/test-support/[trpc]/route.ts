import { createContext } from "@oakai/api/src/context";
import { testSupportRouter as testSupportRouterInternal } from "@oakai/api/src/router/testSupport";
import { router } from "@oakai/api/src/trpc";
import * as Sentry from "@sentry/nextjs";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest, NextResponse } from "next/server";

import { withSentry } from "@/lib/sentry/withSentry";

const testSupportEnabled =
  process.env.NODE_ENV === "development" ||
  process.env.VERCEL_ENV === "preview";

const testSupportRouter = testSupportEnabled
  ? testSupportRouterInternal
  : router({});

const handler = (req: NextRequest, res: NextResponse) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/test-support",
    req,
    router: testSupportRouter,
    createContext: () => {
      return createContext({ req, res });
    },
    onError: (e) => {
      if (process.env.NODE_ENV === "development") {
        console.error(e);
      }
      Sentry.captureException(e.error);
    },
  });

const wrappedHandler = withSentry(handler);

export { wrappedHandler as GET, wrappedHandler as POST };
