import {
  tracingSpans,
  logTracingSpans,
} from "@oakai/core/src/tracing/serverTracing";
import { ReadableSpan } from "@opentelemetry/sdk-trace-base";

export function expectTracingSpan(spanName: string) {
  const assertions = {
    toHaveBeenExecuted: (not = false) => {
      const spans = tracingSpans();
      const spanExists = spans.some(
        (span: ReadableSpan) => span.name === spanName,
      );
      if (spanExists === not) {
        console.error(
          `${not ? "Unexpected" : "Expected"} span "${spanName}" was ${not ? "" : "not "}found. Current spans:`,
        );
        logTracingSpans();
      }
      expect(spanExists).toBe(!not);
    },
    toHaveBeenExecutedWith: (
      attributes: Record<string, unknown>,
      not = false,
    ) => {
      const spans = tracingSpans();
      const span = spans.find((span: ReadableSpan) => span.name === spanName);

      if (!span && !not) {
        console.error(
          `Expected span "${spanName}" was not found. Current spans:`,
        );
        logTracingSpans();
        expect(span).toBeDefined();
        return;
      }

      if (span && not) {
        console.error(
          `Unexpected span "${spanName}" was found. Current spans:`,
        );
        logTracingSpans();
        expect(span).toBeUndefined();
        return;
      }

      if (!not && span) {
        Object.entries(attributes).forEach(([key, value]) => {
          const attributeMatches = span.attributes[key] === value;
          if (!attributeMatches) {
            console.error(
              `Attribute mismatch for span "${spanName}". Expected ${key}=${value}, but got ${span.attributes[key]}. Current spans:`,
            );
            logTracingSpans();
          }
          expect(attributeMatches).toBe(true);
        });
      }
    },
  };

  return {
    ...assertions,
    not: () => ({
      toHaveBeenExecuted: () => assertions.toHaveBeenExecuted(true),
      toHaveBeenExecutedWith: (attributes: Record<string, unknown>) =>
        assertions.toHaveBeenExecutedWith(attributes, true),
    }),
  };
}
