import React from "react";

import {
  type Consent,
  OakCookieConsentProvider,
} from "@oaknational/oak-components";
import { OakConsentProvider } from "@oaknational/oak-consent-client";
import { init } from "@sentry/nextjs";
import type { Decorator } from "@storybook/nextjs";
import { fn } from "storybook/test";

import type { ConsentState } from "../../src/components/ContextProviders/CookieConsentProvider";
import { ServicePolicyMap } from "../../src/lib/cookie-consent/ServicePolicyMap";

/**
 * Consent Decorator for Storybook
 *
 * Provides mock consent context for components that use useOakConsent hook.
 *
 */

interface MockConsentConfig {
  posthogConsent?: ConsentState;
  hubspotConsent?: ConsentState;
  gleapConsent?: ConsentState;
  requiresInteraction?: boolean;
}

declare module "@storybook/nextjs" {
  interface Parameters {
    consentConfig?: MockConsentConfig;
  }
}

// Create a mock consent client for Storybook
const createMockConsentClient = (config: MockConsentConfig = {}) => {
  const {
    posthogConsent = "granted",
    hubspotConsent = "granted",
    gleapConsent = "granted",
    requiresInteraction = false,
  } = config;

  // Since all services map to "analytical-cookies", use the first defined consent state
  const analyticalCookiesConsent =
    posthogConsent ?? hubspotConsent ?? gleapConsent ?? "granted";

  // Create proper PolicyConsent structure
  const policyConsents = [
    {
      policyId: "analytical-cookies",
      policyLabel: "Analytical Cookies",
      policyDescription: "Cookies used for analytics and tracking",
      isStrictlyNecessary: false,
      state: analyticalCookiesConsent,
      consentState: analyticalCookiesConsent,
      updatedAt: new Date().toISOString(),
      policyParties: [],
      getState: () => analyticalCookiesConsent as ConsentState,
    },
  ];

  const mockState = {
    policyConsents,
    requiresInteraction,
  };

  return {
    getConsent: (serviceKey: string) => {
      // All services map to analytical-cookies in ServicePolicyMap
      return analyticalCookiesConsent;
    },
    logConsents: fn().mockResolvedValue(undefined),
    state: mockState,
    getState: () => mockState,
    init: () => {
      // Initialize the mock consent client
      return Promise.resolve();
    },
    onStateChange: fn(),
  };
};

export const ConsentDecorator: Decorator = (Story, { parameters }) => {
  const config = parameters.consentConfig ?? {};
  const mockClient = createMockConsentClient(config);

  return (
    <OakConsentProvider client={mockClient as any}>
      <OakCookieConsentProvider
        policyConsents={mockClient.state.policyConsents}
        onConsentChange={fn()}
      >
        <Story />
      </OakCookieConsentProvider>
    </OakConsentProvider>
  );
};

// Helper function to create consent parameters for stories
export const createConsentParams = (config: MockConsentConfig = {}) => ({
  consentConfig: config,
});

// Common preset configurations
export const consentParams = {
  allGranted: createConsentParams({
    posthogConsent: "granted",
    hubspotConsent: "granted",
    gleapConsent: "granted",
    requiresInteraction: false,
  }),
  allDenied: createConsentParams({
    posthogConsent: "denied",
    hubspotConsent: "denied",
    gleapConsent: "denied",
    requiresInteraction: false,
  }),
  allPending: createConsentParams({
    posthogConsent: "pending",
    hubspotConsent: "pending",
    gleapConsent: "pending",
    requiresInteraction: true,
  }),
  mixed: createConsentParams({
    posthogConsent: "granted",
    hubspotConsent: "denied",
    gleapConsent: "pending",
    requiresInteraction: false,
  }),
};
