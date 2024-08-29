import { tracer as baseTracer, isTest } from "./baseTracing";
import { mockTracer } from "./mockTracer";

export interface TracingSpan {
  setTag: (key: string, value: string | number | boolean | undefined) => void;
  finish: () => void;
}

export const tracer = isTest
  ? mockTracer
  : (baseTracer as unknown as {
      trace: (
        name: string,
        options: Record<string, string | number | boolean>,
        callback: (span: TracingSpan) => Promise<unknown>,
      ) => Promise<unknown>;
    });

export function withTelemetry<T>(
  operationName: string,
  options: Record<string, string | number | boolean | undefined>,
  handler: (span: TracingSpan) => Promise<T>,
): Promise<T> {
  const stringifiedOptions: Record<string, string | number> = Object.entries(
    options,
  ).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      return {
        ...acc,
        [key]: typeof value === "boolean" ? value.toString() : value,
      };
    }
    return acc;
  }, {});

  return tracer.trace(operationName, stringifiedOptions, async (span) => {
    try {
      return await handler(span);
    } catch (error) {
      span.setTag("error", true);
      if (error instanceof Error) {
        span.setTag("error_type", error.constructor.name);
        span.setTag("error_message", error.message);
        if (error.stack) {
          span.setTag("error_stack", error.stack);
        }
      } else {
        span.setTag("error_message", String(error));
      }
      throw error;
    } finally {
      span.finish();
    }
  }) as Promise<T>;
}
