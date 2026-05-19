import { aiLogger } from "@oakai/logger";

import { isClerkAPIResponseError } from "@clerk/shared";
import * as Sentry from "@sentry/node";

const log = aiLogger("auth");

type ClerkOperation = "users.getUser" | "users.updateUserMetadata";

type ClerkDiagnosticContext = {
  procedure: string;
  clerkOperation: ClerkOperation;
  userId: string;
  requestUrl: string;
  cfIpCountry: string | null;
};

function getErrorName(error: unknown) {
  return error instanceof Error ? error.name : typeof error;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function getNumberProperty(error: unknown, property: string) {
  if (!isRecord(error)) {
    return undefined;
  }

  return typeof error[property] === "number" ? error[property] : undefined;
}

function getStringProperty(error: unknown, property: string) {
  if (!isRecord(error)) {
    return undefined;
  }

  return typeof error[property] === "string" ? error[property] : undefined;
}

function getRawClerkErrors(error: unknown): unknown[] | undefined {
  if (isClerkAPIResponseError(error)) {
    const errors: unknown = error.errors;
    return isUnknownArray(errors) ? errors : undefined;
  }

  if (isRecord(error) && isUnknownArray(error.errors)) {
    return error.errors;
  }
}

function getClerkErrors(error: unknown) {
  const errors = getRawClerkErrors(error);
  if (!errors) {
    return undefined;
  }

  return errors.slice(0, 3).map((clerkError) => ({
    code: isRecord(clerkError)
      ? getStringProperty(clerkError, "code")
      : undefined,
    message: isRecord(clerkError)
      ? getStringProperty(clerkError, "message")
      : undefined,
  }));
}

function getClerkStatus(error: unknown) {
  return isClerkAPIResponseError(error)
    ? error.status
    : getNumberProperty(error, "status");
}

function getClerkTraceId(error: unknown) {
  return isClerkAPIResponseError(error)
    ? error.clerkTraceId
    : getStringProperty(error, "clerkTraceId");
}

function getClerkRetryAfter(error: unknown) {
  return isClerkAPIResponseError(error)
    ? error.retryAfter
    : getNumberProperty(error, "retryAfter");
}

function getClerkFailureDiagnostics(
  error: unknown,
  context: ClerkDiagnosticContext,
) {
  return {
    ...context,
    errorName: getErrorName(error),
    errorMessage: getErrorMessage(error),
    status: getClerkStatus(error),
    clerkTraceId: getClerkTraceId(error),
    retryAfter: getClerkRetryAfter(error),
    clerkErrors: getClerkErrors(error),
  };
}

function recordClerkFailure(
  details: ReturnType<typeof getClerkFailureDiagnostics>,
) {
  Sentry.setTag("procedure", details.procedure);
  Sentry.setTag("clerk.operation", details.clerkOperation);
  if (typeof details.status !== "undefined") {
    Sentry.setTag("clerk.status", String(details.status));
  }
  Sentry.setContext("clerk", details);
  log.error(`Clerk request failed in ${details.procedure}`, details);
}

export async function withClerkDiagnostics<T>(
  context: ClerkDiagnosticContext,
  operation: () => Promise<T>,
) {
  try {
    return await operation();
  } catch (error) {
    recordClerkFailure(getClerkFailureDiagnostics(error, context));
    throw error;
  }
}
