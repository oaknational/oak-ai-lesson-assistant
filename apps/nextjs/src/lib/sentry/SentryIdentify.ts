"use client";

import * as Sentry from "@sentry/nextjs";

import { useClerkIdentify } from "../clerk/useClerkIdentify";

const sentrySetUser = ({ userId }: { userId: string }) => {
  if (userId) {
    Sentry.setUser({
      id: userId,
    });
  }
};
const sentryUnsetUser = () => {
  Sentry.setUser(null);
};

/**
 * This component identifies the user with Sentry when the user is logged in and unsets
 * the user when the user is logged out.
 */
export const SentryIdentify = () => {
  useClerkIdentify({
    onIdentify: sentrySetUser,
    onLogout: sentryUnsetUser,
  });
  return null;
};
