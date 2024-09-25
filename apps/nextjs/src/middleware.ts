import * as Sentry from "@sentry/nextjs";
import { authMiddleware } from "middlewares/auth.middleware";
import { addCspHeaders } from "middlewares/csp";
import { NextMiddlewareResult } from "next/dist/server/web/types";
import { NextMiddleware, NextResponse } from "next/server";

import { sentryCleanup } from "./lib/sentry/sentryCleanup";

function handleError(error: unknown, extra: Record<string, unknown>): Response {
  const wrappedError = new Error("Error in nextMiddleware");
  wrappedError.cause = error;
  Sentry.captureException(wrappedError, { extra });

  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

const nextMiddleware: NextMiddleware = async (request, event) => {
  let response: NextMiddlewareResult;

  try {
    response = await authMiddleware(request, event);
    response = addCspHeaders(response, request);
  } catch (error) {
    response = handleError(error, { request, event });
  } finally {
    await sentryCleanup();
  }

  return response;
};

export default nextMiddleware;

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|__next|monitoring).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
