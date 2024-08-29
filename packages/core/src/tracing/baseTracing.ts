import tracer from "dd-trace";

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
      : options.debug || process.env.DD_TRACE_DEBUG === "true";

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
    const initialisationOptions = {
      env: options.env ?? environment,
      service: options.service ?? "oak-ai",
      hostname,
      logInjection:
        options.logInjection !== undefined ? options.logInjection : true,
      runtimeMetrics:
        options.runtimeMetrics !== undefined ? options.runtimeMetrics : true,
      sampleRate: options.sampleRate ?? 1,
      profiling: options.profiling !== undefined ? options.profiling : true,
      plugins: options.plugins !== undefined ? options.plugins : false,
      debug: true,
      logLevel,
      logger: {
        debug: (message: string | Error) =>
          console.debug(`[dd-trace debug] ${message}`),
        info: (message: string | Error) =>
          console.info(`[dd-trace info] ${message}`),
        warn: (message: string | Error) =>
          console.warn(`[dd-trace warn] ${message}`),
        error: (message: string | Error) =>
          console.error(`[dd-trace error] ${message}`),
      },
    };
    console.log(
      "Initializing Datadog tracer with options",
      initialisationOptions,
    );
    tracer.init(initialisationOptions);
  }
}

export { tracer };
