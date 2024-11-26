"use client";

import { useEffect } from "react";

import * as Sentry from "@sentry/nextjs";

import FullPageWarning from "@/components/FullPageWarning";

export default function GlobalError({
  error,
}: {
  readonly error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      extra: { globalError: true },
    });
  }, [error]);

  return (
    <html>
      <body>
        <FullPageWarning>
          <FullPageWarning.Icon icon="acorn" size="xl" />

          <FullPageWarning.Header>Something went wrong!</FullPageWarning.Header>

          <FullPageWarning.Button href="/">
            AI experiments homepage
          </FullPageWarning.Button>
        </FullPageWarning>
      </body>
    </html>
  );
}
