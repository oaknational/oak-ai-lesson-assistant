// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_RELEASE_STAGE,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  /**
   * https://docs.sentry.io/platforms/javascript/configuration/filtering/#using--1
   */
  beforeSend(event) {
    if (event.exception?.values?.some((value) => value?.type === "URIError")) {
      /**
       * An issue of unknown origin that is causing a URIError, which caused us to exceed our error event limit on Sentry.
       * https://oak-national-academy.sentry.io/issues/970891/?environment=production&project=4507089597300816
       * The first instance of the error occurred in v1.1.22, when Clerk was updated to 5.1
       */
      const SAMPLE_RATE = 0.01;
      // sample the error event at a rate of 1%
      if (Math.random() > SAMPLE_RATE) {
        return null;
      }
    }

    return event;
  },
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
