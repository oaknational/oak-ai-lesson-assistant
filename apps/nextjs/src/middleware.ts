import type { NextMiddlewareResult } from "next/dist/server/web/types";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getRootErrorCause } from "./lib/errors/getRootErrorCause";
import { sentryCleanup } from "./lib/sentry/sentryCleanup";
import { authMiddleware } from "./middlewares/auth.middleware";
import type { CspConfig } from "./middlewares/csp";
import { addCspHeaders } from "./middlewares/csp";
import { logError } from "./middlewares/middlewareErrorLogging";

const parseEnvironment = (
  env: string | undefined,
): "development" | "preview" | "production" | "test" => {
  if (
    env === "development" ||
    env === "preview" ||
    env === "production" ||
    env === "test"
  ) {
    return env;
  }
  switch (env) {
    case "dev":
      return "development";
    case "stg":
      return "preview";
    case "prd":
      return "production";
    default:
      return "development";
  }
};

const parseVercelEnv = (
  env: string | undefined,
): "development" | "preview" | "production" => {
  if (env === "development" || env === "preview" || env === "production") {
    return env;
  }
  return "development";
};

const environment = parseEnvironment(process.env.NEXT_PUBLIC_ENVIRONMENT);

const cspConfig: CspConfig = {
  strictCsp: process.env.STRICT_CSP === "true",
  environment,
  sentryEnv: process.env.NEXT_PUBLIC_SENTRY_ENV || "",
  sentryRelease: process.env.NEXT_PUBLIC_APP_VERSION || "",
  sentryReportUri: process.env.SENTRY_REPORT_URI || "",
  cspReportSampleRate: process.env.NEXT_PUBLIC_CSP_REPORT_SAMPLE_RATE || "1",
  vercelEnv: parseVercelEnv(process.env.VERCEL_ENV),
  enabledPolicies: {
    clerk: ["development", "preview"].includes(environment),
    avo: ["development", "preview"].includes(environment),
    posthog: process.env.NEXT_PUBLIC_ENVIRONMENT === "dev",
    devConsent: process.env.NEXT_PUBLIC_ENVIRONMENT === "dev",
    mux: true,
    vercel: process.env.VERCEL_ENV === "preview",
    localhost: ["development", "test"].includes(environment),
  },
};

export async function handleError(
  error: unknown,
  request: NextRequest,
  event: NextFetchEvent,
): Promise<Response> {
  const rootError = getRootErrorCause(error);

  await logError(rootError, request, event);

  if (rootError instanceof SyntaxError) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
