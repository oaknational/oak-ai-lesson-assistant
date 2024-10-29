import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.TURBOPACK) {
    return;
  }
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation/tracer");
  }
}

export const onRequestError = Sentry.captureRequestError;
