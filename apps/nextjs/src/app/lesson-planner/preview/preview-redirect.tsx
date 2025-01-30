"use client";

/*
 *
 * This page accounts for legacy share links that are not compatible with the new share link format.
 *
 *
 */
import { useRouter, useSearchParams } from "next/navigation";

export default function PreviewRedirect() {
  const router = useRouter();

  const searchParams = useSearchParams();

  // Potentially incorrect
  const id =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    searchParams && searchParams?.entries.length > 1 && searchParams[0][1];
  router.push(`/lesson-planner/preview/${id}`);
  return null;
}
