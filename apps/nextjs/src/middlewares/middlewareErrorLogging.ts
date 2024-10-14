import * as Sentry from "@sentry/nextjs";
import { NextFetchEvent, NextRequest } from "next/server";

import { ErrorWithPotentialCause } from "../middleware";

export async function logError(
  error: unknown,
  request: NextRequest,
  event: NextFetchEvent,
): Promise<void> {
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
    bodyText = "Failed to read request body";
  }

  const errorWithCause = error as ErrorWithPotentialCause;

  if (
    error instanceof SyntaxError ||
    errorWithCause.cause instanceof SyntaxError
  ) {
    const syntaxError =
      error instanceof SyntaxError
        ? error
        : (errorWithCause.cause as SyntaxError);

    // Log the error so it is picked up by the log drain (eg. DataDog)
    console.warn({
      event: "middleware.syntaxError",
      error: syntaxError.message,
      url: requestInfo.url,
      request: requestInfo,
    });
    // Do not log SyntaxErrors to Sentry
    return;
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
      errorType: "NextMiddlewareError",
    },
  });
}
