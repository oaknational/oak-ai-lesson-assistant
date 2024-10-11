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
import { CspConfig, addCspHeaders } from "./middlewares/csp";

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

const cspConfig: CspConfig = {
  strictCsp: process.env.STRICT_CSP === "true",
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "",
  sentryEnv: process.env.NEXT_PUBLIC_SENTRY_ENV || "",
  sentryRelease: process.env.NEXT_PUBLIC_APP_VERSION || "",
  sentryReportUri: process.env.SENTRY_REPORT_URI || "",
  cspReportSampleRate: process.env.NEXT_PUBLIC_CSP_REPORT_SAMPLE_RATE || "1",
  vercelEnv: process.env.VERCEL_ENV || "",
  enabledPolicies: {
    clerk: ["dev", "stg"].includes(process.env.NEXT_PUBLIC_ENVIRONMENT || ""),
    avo: ["dev", "stg"].includes(process.env.NEXT_PUBLIC_ENVIRONMENT || ""),
    posthog: process.env.NEXT_PUBLIC_ENVIRONMENT === "dev",
    devConsent: process.env.NEXT_PUBLIC_ENVIRONMENT === "dev",
    mux: true,
    vercel: process.env.VERCEL_ENV === "preview",
  },
};

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
    response = addCspHeaders(response, request, cspConfig);
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
