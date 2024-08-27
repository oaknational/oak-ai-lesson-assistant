import * as Sentry from "@sentry/nextjs";

export async function sentryCleanup() {
  await Sentry.flush(2000);
  Sentry.setUser(null);
}
