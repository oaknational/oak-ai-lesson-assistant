"use client";

import type { PropsWithChildren } from "react";
import { useCallback, useEffect } from "react";

import {
  type Consent,
  OakCookieConsent,
  OakCookieConsentProvider,
  useCookieConsent as useCookieConsentUI,
} from "@oaknational/oak-components";
import {
  OakConsentProvider,
  useOakConsent,
} from "@oaknational/oak-consent-client";
import * as Sentry from "@sentry/nextjs";

import { consentClient } from "@/lib/cookie-consent/consentClient";

export type ConsentState = "granted" | "denied" | "pending";

const RequiresInteraction = () => {
  const { state } = useOakConsent();
  const { showBanner } = useCookieConsentUI();

  useEffect(() => {
    if (state.requiresInteraction) {
      showBanner();
    }
  }, [state.requiresInteraction, showBanner]);

  return null;
};

const CookieConsentUIProvider = ({ children }: PropsWithChildren) => {
  const { state, logConsents } = useOakConsent();

  const performLogConsents = useCallback(
    (consents: Consent[]) => {
      logConsents(consents).catch((error) => {
        Sentry.captureException(error, { extra: { consents } });
      });
    },
    [logConsents],
  );

  return (
    <OakCookieConsentProvider
      policyConsents={state.policyConsents}
      onConsentChange={performLogConsents}
    >
      {children}
      <OakCookieConsent
        policyURL={"/legal/cookies"}
        isFixed={true}
        zIndex={99999}
      />
      <RequiresInteraction />
    </OakCookieConsentProvider>
  );
};

export const CookieConsentProvider = (props: PropsWithChildren) => (
  <OakConsentProvider client={consentClient}>
    <CookieConsentUIProvider {...props}></CookieConsentUIProvider>
  </OakConsentProvider>
);
