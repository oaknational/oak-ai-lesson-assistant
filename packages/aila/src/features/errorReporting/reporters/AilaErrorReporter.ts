import type { AilaErrorReportingFeature } from "../../types";
import type { AilaErrorBreadcrumb, AilaErrorSeverity } from "../types";

export abstract class AilaErrorReporter implements AilaErrorReportingFeature {
  abstract captureException(
    error: Error,
    level?: AilaErrorSeverity,
    context?: Record<string, unknown>,
  ): void;
  abstract captureMessage(message: string, level: AilaErrorSeverity): void;
  abstract addBreadcrumb(breadcrumb: AilaErrorBreadcrumb): void;
  abstract setContext(name: string, context: Record<string, unknown>): void;
  abstract setUser(id: string): void;

  reportError(error: unknown, message?: string, level?: AilaErrorSeverity) {
    if (message) {
      this.captureMessage(message, level ?? "error");
    }
    this.captureException(error as Error, level ?? "error");
  }

  tryWithErrorReporting = <T>(
    fn: () => T,
    level: AilaErrorSeverity = "error",
    message?: string,
    breadcrumbs?: {
      category: string;
      message: string;
    },
  ): T | null => {
    try {
      return fn();
    } catch (e) {
      if (breadcrumbs) {
        this.addBreadcrumb({ ...breadcrumbs, level });
      }
      this.reportError(e, message ?? "An error was handled", level);
      return null;
    }
  };
}
