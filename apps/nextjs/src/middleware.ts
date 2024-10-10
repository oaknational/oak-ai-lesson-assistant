import * as Sentry from "@sentry/nextjs";
import { NextMiddlewareResult } from "next/dist/server/web/types";
import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { sentryCleanup } from "./lib/sentry/sentryCleanup";
import { authMiddleware } from "./middlewares/auth.middleware";
import { addCspHeaders } from "./middlewares/csp";

export type ErrorWithPotentialCause = Error & {
  cause?: unknown;
};

export async function handleError(
  error: unknown,
  request: NextRequest,
  event: NextFetchEvent,
): Promise<Response> {
  const requestInfo = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers),
    cookies: Object.fromEntries(request.cookies),
    geo: request.geo,
    ip: request.ip,
    nextUrl: {
      pathname: request.nextUrl.pathname,
      search: request.nextUrl.search,
    },
  };

  const eventInfo = {
    sourcePage: event.sourcePage,
  };

  let bodyText = "";
  try {
    const clonedRequest = request.clone();
    bodyText = await clonedRequest.text();
  } catch (bodyError) {
    console.error("Failed to read request body", bodyError);
    bodyText = "Failed to read body";
  }

  // Cast error to our custom type
  const errorWithCause = error as ErrorWithPotentialCause;

  if (
    error instanceof SyntaxError ||
    errorWithCause.cause instanceof SyntaxError
  ) {
    const syntaxError =
      error instanceof SyntaxError
        ? error
        : (errorWithCause.cause as SyntaxError);

    console.warn({
      event: "middleware.syntaxError",
      error: syntaxError.message,
      url: requestInfo.url,
      request: requestInfo,
    });

    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const wrappedError =
    error instanceof Error
      ? error
      : new Error("Error in nextMiddleware", { cause: error });

  Sentry.captureException(wrappedError, {
    extra: {
      requestInfo,
      eventInfo,
      bodyText,
      errorType: "OtherError",
    },
  });

  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
