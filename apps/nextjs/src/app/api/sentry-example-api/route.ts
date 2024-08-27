import { withSentry } from "@/lib/sentry/withSentry";

export const dynamic = "force-dynamic";

// A faulty API route to test Sentry's error monitoring
function getHandler() {
  throw new Error("Sentry Example API Route Error");
}

export const GET = withSentry(getHandler);
