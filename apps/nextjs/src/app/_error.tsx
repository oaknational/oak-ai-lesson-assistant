"use client";

import { useEffect } from "react";

/**
 *
 * This page should never be reached as it is deprecated using the app router.
 * By having this page we will silence warnings from vercel.
 * This page redirects to the global handle all error page.
 */

export default function DeprecatedErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  // redirect to global-error.tsx
  useEffect(() => {
    window.location.href = "/global-error";
  }, [error]);
}
