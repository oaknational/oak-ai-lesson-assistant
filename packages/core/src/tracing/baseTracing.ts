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
}

export function initializeTracer(options: DatadogOptions) {
  const hostname =
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    process.env.VERCEL_URL ??
    options?.hostname ??
    "localhost";

  if (isTest || isLocalDev) {
    tracer.init({
      logInjection: false,
      runtimeMetrics: false,
      sampleRate: 0,
      profiling: false,
      plugins: false,
    });
    console.log(
      `Initialized no-op tracer for ${isTest ? "test" : "local development"} environment`,
    );
  } else {
    tracer.init({
      env: options.env || environment,
      service: options.service || "oak-ai",
      hostname,
      logInjection:
        options.logInjection !== undefined ? options.logInjection : true,
      runtimeMetrics:
        options.runtimeMetrics !== undefined ? options.runtimeMetrics : true,
      sampleRate: options.sampleRate || 1,
      profiling: options.profiling !== undefined ? options.profiling : true,
      plugins: options.plugins !== undefined ? options.plugins : true,
    });
  }
}

export { tracer };
