import { aiLogger } from "@oakai/logger";

import tracer from "dd-trace";

const log = aiLogger("tracing");

export const environment = process.env.NODE_ENV || "development";
export const isTest = environment === "test";
export const isLocalDev = environment === "development";

interface DatadogOptions {
  env?: string;
  service?: string;
  hostname?: string;
  logInjection?: boolean;
  runtimeMetrics?: boolean;
  sampleRate?: number;
  profiling?: boolean;
  plugins?: boolean;
  debug?: boolean;
}

export function initializeTracer(options: DatadogOptions) {
  const hostname =
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    process.env.VERCEL_URL ??
    options?.hostname ??
    "localhost";

  const debugMode =
    !isTest && !isLocalDev
      ? true
      : (options.debug ?? process.env.DD_TRACE_DEBUG === "true");

  const logLevel: "debug" | "error" = debugMode ? "debug" : "error";
  if (isTest || isLocalDev) {
    tracer.init({
      logInjection: false,
      runtimeMetrics: false,
      sampleRate: 0,
      profiling: false,
      plugins: false,
    });
  } else {
    const initialisationOptions: tracer.TracerOptions = {
      env: options.env ?? environment,
      service: options.service ?? "oak-ai",
      hostname,
      logInjection: options.logInjection ?? true,
      runtimeMetrics: options.runtimeMetrics ?? true,
      sampleRate: options.sampleRate ?? 1,
      profiling: options.profiling ?? true,
      plugins: options.plugins ?? false,
      logLevel,
      logger: {
        debug: (message: string | Error) =>
          log.info(
            `[dd-trace debug] ${typeof message === "string" ? message : message.message}`,
          ),
        info: (message: string | Error) =>
          log.info(
            `[dd-trace info] ${typeof message === "string" ? message : message.message}`,
          ),
        warn: (message: string | Error) =>
          log.info(
            `[dd-trace warn] ${typeof message === "string" ? message : message.message}`,
          ),
        error: (message: string | Error) =>
          log.error(
            `[dd-trace error] ${typeof message === "string" ? message : message.message}`,
          ),
      },
    };
    log.info("Initializing Datadog tracer with options", initialisationOptions);
    tracer.init(initialisationOptions);
  }
}

export { tracer };
