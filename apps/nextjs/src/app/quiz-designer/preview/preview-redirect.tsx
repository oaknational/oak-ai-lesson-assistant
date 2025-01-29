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
  // This is potentially incorrect but it looks like the return type of useSearchParams has changed
  const id =
    searchParams &&
    searchParams?.entries.length > 1 &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    searchParams.entries[0][1];
  router.push(`/quiz-designer/preview/${id}`);
  return null;
}
