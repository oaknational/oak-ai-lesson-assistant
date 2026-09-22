// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";

import { getAccelerateConnectivityCode } from "./src/lib/sentry/accelerateConnectivity";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_RELEASE_STAGE,
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  beforeSend(event, hint) {
    const code = getAccelerateConnectivityCode(hint.originalException);

    if (code) {
      /**
       * Prisma groups these by the query that happened to be running, so a
       * single spell of database unavailability opens a separate "new" Sentry
       * issue per call site. That hides the fact that it is one recurring
       * infrastructure problem. Collapse them into one issue per error code so
       * the frequency over time is visible.
       */
      event.fingerprint = ["prisma-accelerate-connectivity", code];
      event.tags = { ...event.tags, prisma_error_code: code };
    }

    return event;
  },

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate:
    process.env.NEXT_PUBLIC_SENTRY_ENV === "production" ? 0.05 : 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
});
