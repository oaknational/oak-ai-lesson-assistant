import * as Sentry from "@sentry/node";

import type { CompletedSpan, InstrumentationStrategy } from "./types";

/**
 * Sentry instrumentation strategy.
 * Creates breadcrumbs for each completed span, useful for debugging
 * production issues.
 */
export const sentryInstrumentation: InstrumentationStrategy = {
  onSpanEnd: (span: CompletedSpan) => {
    Sentry.addBreadcrumb({
      category: "quiz-rag",
      message: span.name,
      data: {
        durationMs: span.durationMs,
        ...span.data,
      },
      level: "info",
    });
  },
};

/**
 * No-op instrumentation strategy.
 * Spans are still collected by the tracer but no callbacks are invoked.
 * Useful when you only need to retrieve spans via tracer.getCompletedSpans().
 */
export const noopInstrumentation: InstrumentationStrategy = {};
