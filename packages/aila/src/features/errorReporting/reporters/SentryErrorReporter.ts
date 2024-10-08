import * as Sentry from "@sentry/nextjs";

import { AilaErrorSeverity, AilaErrorBreadcrumb } from "../types";
import { AilaErrorReporter } from "./AilaErrorReporter";

export class SentryErrorReporter extends AilaErrorReporter {
  public captureException(
    error: Error,
    level?: AilaErrorSeverity,
    context?: Record<string, unknown>,
  ): void {
    console.error(error);
    Sentry.withScope(function (scope) {
      scope.setLevel(level ?? "error");
      Sentry.captureException(error, { extra: context });
    });
  }

  public captureMessage(message: string, level: AilaErrorSeverity): void {
    console.log(message);
    Sentry.captureMessage(message, level as Sentry.SeverityLevel);
  }

  public addBreadcrumb(breadcrumb: AilaErrorBreadcrumb): void {
    Sentry.addBreadcrumb(breadcrumb as Sentry.Breadcrumb);
  }

  public setContext(name: string, context: Record<string, unknown>): void {
    Sentry.setContext(name, context);
  }

  public setUser(id: string) {
    Sentry.setUser({ id });
  }
}
