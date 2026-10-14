import type { ClerkMiddlewareSessionAuthObject } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

export function sentrySetUser({ userId }: ClerkMiddlewareSessionAuthObject) {
  if (userId) {
    Sentry.setUser({
      id: userId,
    });
  } else {
    Sentry.setUser(null);
  }
}
