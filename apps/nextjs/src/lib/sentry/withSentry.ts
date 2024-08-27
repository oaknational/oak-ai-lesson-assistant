import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/node";
import { NextRequest, NextResponse } from "next/server";

import { sentryCleanup } from "./sentryCleanup";
import { sentrySetUser } from "./sentrySetUser";

/**
 * Wraps an API route handler with Sentry error monitoring.
 * Whilst Sentry does this automatically with instrumentation, this function
 * allows for more control over the Sentry context, setting the user and
 * cleaning up after.
 */
export function withSentry(
  handler: (req: NextRequest, res: NextResponse) => Promise<Response> | void,
) {
  return async (req: NextRequest, res: NextResponse) => {
    sentrySetUser(auth());
    try {
      return await handler(req, res);
    } catch (error) {
      Sentry.captureException(error);
      return new Response("Internal Server Error", {
        status: 500,
      });
    } finally {
      await sentryCleanup();
    }
  };
}
