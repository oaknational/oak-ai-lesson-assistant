import { tracer as baseTracer, isTest } from "./baseTracing";
import { mockTracer } from "./mockTracer";

export interface TracingSpan {
  setTag: (key: string, value: string | number | boolean | undefined) => void;
  finish: () => void;
}

function logTrace(
  level: "INFO" | "ERROR",
  message: string,
  data: Record<string, unknown>,
) {
  if (!["test", "development"].includes(process.env.NODE_ENV || "")) {
    console[level.toLowerCase() as "info" | "error"](
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        logType: "TRACE",
        message,
        ...data,
      }),
    );
  }
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
  const startTime = Date.now();
  const traceId = Math.random().toString(36).substring(2, 15);

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

  logTrace("INFO", "Trace Start", {
    operation: operationName,
    traceId,
    options: stringifiedOptions,
  });

  return tracer.trace(operationName, stringifiedOptions, async (span) => {
    try {
      const result = await handler(span);
      const duration = Date.now() - startTime;
      logTrace("INFO", "Trace End", {
        operation: operationName,
        traceId,
        duration,
        status: "success",
        options: stringifiedOptions,
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logTrace("ERROR", "Trace Error", {
        operation: operationName,
        traceId,
        duration,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        options: stringifiedOptions,
      });
      throw error;
    } finally {
      span.finish();
    }
  }) as Promise<T>;
}
