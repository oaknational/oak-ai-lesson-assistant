import { aiLogger } from "@oakai/logger";
import * as Sentry from "@sentry/nextjs";

import type { AilaErrorSeverity, AilaErrorBreadcrumb } from "../types";
import { AilaErrorReporter } from "./AilaErrorReporter";

const log = aiLogger("aila:errors");

export class SentryErrorReporter extends AilaErrorReporter {
  public captureException(
    error: Error,
    level?: AilaErrorSeverity,
    context?: Record<string, unknown>,
  ): void {
    log.error(error);
    Sentry.withScope(function (scope) {
      scope.setLevel(level ?? "error");
      Sentry.captureException(error, { extra: context });
    });
  }

  public captureMessage(message: string, level: AilaErrorSeverity): void {
    log.info(message);
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
