"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

import FullPageWarning from "@/components/FullPageWarning";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      extra: { globalError: true },
    });
  }, [error]);

  return (
    <FullPageWarning>
      <FullPageWarning.Icon icon="acorn" size="xl" />

      <FullPageWarning.Header>Something went wrong!</FullPageWarning.Header>

      <FullPageWarning.Button href="/">
        AI Experiments homepage
      </FullPageWarning.Button>
    </FullPageWarning>
  );
}
