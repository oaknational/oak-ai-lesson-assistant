import { aiLogger } from "@oakai/logger";
import { OakConsentClient } from "@oaknational/oak-consent-client";
import * as Sentry from "@sentry/nextjs";

const log = aiLogger("consent");

const appSlug = "ai-beta";
const policiesUrl = process.env.NEXT_PUBLIC_OAK_CONSENT_POLICIES_URL as string;
const consentLogUrl = process.env.NEXT_PUBLIC_OAK_CONSENT_LOG_URL as string;
const userLogUrl = process.env.NEXT_PUBLIC_OAK_CONSENT_USER_LOG_URL as string;

if (!policiesUrl || !consentLogUrl || !userLogUrl) {
  throw new Error("Missing environment variables for OakConsentClient");
}

export const consentClient = new OakConsentClient({
  appSlug,
  policiesUrl,
  consentLogUrl,
  userLogUrl,
  onError: (error) => {
    log("Oak consent client error", error);
    Sentry.captureException(error);
  },
});
