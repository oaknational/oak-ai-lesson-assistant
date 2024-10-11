import { NextMiddlewareResult } from "next/dist/server/web/types";
import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { logError } from "./lib/errors/server/middlewareErrorLogging";
import { sentryCleanup } from "./lib/sentry/sentryCleanup";
import { authMiddleware } from "./middlewares/auth.middleware";
import { addCspHeaders } from "./middlewares/csp";

export type ErrorWithPotentialCause = Error & {
  cause?: unknown;
};

function determineErrorResponse(error: unknown): Response {
  const errorWithCause = error as ErrorWithPotentialCause;

  if (
    error instanceof SyntaxError ||
    errorWithCause.cause instanceof SyntaxError
  ) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

export async function handleError(
  error: unknown,
  request: NextRequest,
  event: NextFetchEvent,
): Promise<Response> {
  await logError(error, request, event);
  return determineErrorResponse(error);
}

const nextMiddleware: NextMiddleware = async (request, event) => {
  let response: NextMiddlewareResult;

  try {
    response = await authMiddleware(request, event);
    response = addCspHeaders(response, request);
  } catch (error) {
    response = await handleError(error, request, event);
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
