// #TODO This file should stop referring to Sentry
// and instead these methods should take an Aila instance
// Then, we can use the errorReporting feature instance
// to report errors using the correct error reporting back-end
import * as Sentry from "@sentry/nextjs";

export function reportErrorToSentry(
  error: unknown,
  message: string,
  level: Sentry.SeverityLevel = "error",
  reportToSentry: boolean = true,
) {
  console.error(message, error);
  if (reportToSentry) {
    Sentry.captureMessage(message, level);

    Sentry.withScope(function (scope) {
      scope.setLevel(level);
      Sentry.captureException(error);
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
): T | null => {
  try {
    return fn();
  } catch (e) {
    if (breadcrumbs) {
      Sentry.addBreadcrumb({ ...breadcrumbs, level });
    }
    reportErrorToSentry(e, message ?? "An error was handled", level);
    return null;
  }
};
