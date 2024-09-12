"use client";

import { useEffect, useRef } from "react";

import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const hasReported = useRef(false);
  useEffect(() => {
    if (hasReported.current) return;
    Sentry.captureException(error);
    hasReported.current = true;
  }, [error]);
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
