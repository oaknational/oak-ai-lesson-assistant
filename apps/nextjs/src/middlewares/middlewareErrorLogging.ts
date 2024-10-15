import * as Sentry from "@sentry/nextjs";
import { NextFetchEvent, NextRequest } from "next/server";

export async function logError(
  rootError: unknown,
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

  if (rootError instanceof SyntaxError) {
    // Log the error so it is picked up by the log drain (eg. DataDog)
    console.warn({
      event: "middleware.syntaxError",
      error: rootError.message,
      url: requestInfo.url,
      request: requestInfo,
    });
    // Do not log SyntaxErrors to Sentry
    return;
  }

  const wrappedError =
    rootError instanceof Error
      ? rootError
      : new Error("Error in nextMiddleware", { cause: rootError });

  Sentry.captureException(wrappedError, {
    extra: {
      requestInfo,
      eventInfo,
      bodyText,
      errorType: "NextMiddlewareError",
    },
  });
}
