import { initializeTracer, tracer as baseTracer, isTest } from "./baseTracing";
import { mockTracer } from "./mockTracer";

initializeTracer({});

export interface TracingSpan {
  setTag: (key: string, value: any) => void;
  finish: () => void;
}

export const tracer = isTest
  ? mockTracer
  : (baseTracer as unknown as {
      trace: (
        name: string,
        options: any,
        callback: (span: TracingSpan) => Promise<any>,
      ) => Promise<any>;
    });

export function withTelemetry<T>(
  operationName: string,
  options: Record<string, any>,
  handler: (span: TracingSpan) => Promise<T>,
): Promise<T> {
  return tracer.trace(operationName, options, async (span) => {
    try {
      return await handler(span);
    } catch (error) {
      span.setTag("error", true);
      if (error instanceof Error) {
        span.setTag("error_type", error.constructor.name);
        span.setTag("error_message", error.message);
        span.setTag("error_stack", error.stack);
      } else {
        span.setTag("error_message", String(error));
      }
      throw error;
    } finally {
      span.finish();
    }
  });
}
