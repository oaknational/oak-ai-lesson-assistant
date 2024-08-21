import { ClerkMiddlewareAuthObject } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";

export function sentrySetUser({ userId }: ClerkMiddlewareAuthObject) {
  if (userId) {
    Sentry.setUser({
      id: userId,
    });
  } else {
    Sentry.setUser(null);
  }
}
