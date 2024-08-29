import tracer from "dd-trace";

export const environment = process.env.NODE_ENV || "development";
export const isTest = environment === "test";
export const isLocalDev = environment === "development";

export function initializeTracer() {
  if (isTest) {
    // Use a no-op tracer for tests
    tracer.init({
      logInjection: true,
      runtimeMetrics: true,
      sampleRate: 1,
      // This ensures no data is actually sent to Datadog during tests
      profiling: false,
      plugins: false,
    });
  } else if (isLocalDev) {
    // Use local agent for development
    tracer.init({
      env: "development",
      service: "oak-ai",
      logInjection: true,
      runtimeMetrics: true,
      sampleRate: 1,
    });
  } else {
    // Production configuration
    tracer.init({
      env: environment,
      service: "oak-ai",
      logInjection: true,
      runtimeMetrics: true,
      sampleRate: 1,
    });
  }
}

export { tracer };
