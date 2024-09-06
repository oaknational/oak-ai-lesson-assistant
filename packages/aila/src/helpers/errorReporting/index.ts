// #TODO This file should stop referring to Sentry
// and instead these methods should take an Aila instance
// Then, we can use the errorReporting feature instance
// to report errors using the correct error reporting back-end
import * as Sentry from "@sentry/nextjs";

export function reportErrorToSentry(
  error: unknown,
  {
    message,
    level = "error",
    reportToSentry = true,
    extra,
  }: {
    message: string;
    level: Sentry.SeverityLevel;
    reportToSentry?: boolean;
    extra?: Record<string, unknown>;
  },
) {
  console.error(message, error);
  if (reportToSentry) {
    Sentry.captureMessage(message, level);

    Sentry.withScope(function (scope) {
      scope.setLevel(level);
      Sentry.captureException(error, { extra });
    });
  }
}

export const tryWithErrorReporting = <T>(
  fn: () => T,
  message: string,
  level: Sentry.SeverityLevel = "error",
  breadcrumbs?: {
    category: string;
    message: string;
  },
  extra?: Record<string, unknown>,
): T | null => {
  try {
    return fn();
  } catch (e) {
    if (breadcrumbs) {
      Sentry.addBreadcrumb({ ...breadcrumbs, level });
    }
    reportErrorToSentry(e, {
      message: message ?? "An error was handled",
      level,
      extra,
    });
    return null;
  }
};
