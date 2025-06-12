import * as Sentry from "@sentry/nextjs";

export async function register() {
  // https://github.com/oaknational/oak-ai-lesson-assistant/pull/328
  // https://github.com/vercel/next.js/issues/70424
  if (process.env.TURBOPACK) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
