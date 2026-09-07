/**
 * @jest-environment jsdom
 */
import type { ReactNode } from "react";

import { renderHook } from "@testing-library/react";

import {
  FeatureFlagProvider,
  useBootstrappedFeatureFlag,
  useBootstrappedPayload,
} from "./FeatureFlagProvider";

// The analytics provider drags in Clerk, which jest can't load. These hooks don't
// use it.
jest.mock("@/lib/analytics/useAnalytics", () => ({
  __esModule: true,
  default: () => ({
    posthogAiBetaClient: {
      onFeatureFlags: () => () => {},
      isFeatureEnabled: () => false,
    },
  }),
}));

const makeWrapper =
  (
    bootstrappedFeatures: Record<string, string | boolean>,
    bootstrappedPayloads: Record<string, unknown> = {},
  ) =>
  ({ children }: { children: ReactNode }) => (
    <FeatureFlagProvider
      bootstrappedFeatures={bootstrappedFeatures}
      bootstrappedPayloads={bootstrappedPayloads}
    >
      {children}
    </FeatureFlagProvider>
  );

describe("useBootstrappedFeatureFlag", () => {
  it("is true when the bootstrapped value is true", () => {
    const { result } = renderHook(() => useBootstrappedFeatureFlag("a-flag"), {
      wrapper: makeWrapper({ "a-flag": true }),
    });

    expect(result.current).toBe(true);
  });

  it("is false when the flag is absent", () => {
    const { result } = renderHook(() => useBootstrappedFeatureFlag("a-flag"), {
      wrapper: makeWrapper({}),
    });

    expect(result.current).toBe(false);
  });

  it("is false for a multivariate value, so a variant key can't switch a boolean gate on", () => {
    const { result } = renderHook(() => useBootstrappedFeatureFlag("a-flag"), {
      wrapper: makeWrapper({ "a-flag": "some-variant" }),
    });

    expect(result.current).toBe(false);
  });

  // useClientSideFeatureFlag reports every flag as on when this is set, which would
  // make the banner impossible to check in its off state locally.
  it("ignores NEXT_PUBLIC_POSTHOG_DEBUG", () => {
    const original = process.env.NEXT_PUBLIC_POSTHOG_DEBUG;
    process.env.NEXT_PUBLIC_POSTHOG_DEBUG = "true";

    try {
      const { result } = renderHook(
        () => useBootstrappedFeatureFlag("a-flag"),
        { wrapper: makeWrapper({}) },
      );

      expect(result.current).toBe(false);
    } finally {
      process.env.NEXT_PUBLIC_POSTHOG_DEBUG = original;
    }
  });
});

describe("useBootstrappedPayload", () => {
  it("returns the payload attached to the flag", () => {
    const payload = { message: "hello" };
    const { result } = renderHook(() => useBootstrappedPayload("a-flag"), {
      wrapper: makeWrapper({ "a-flag": true }, { "a-flag": payload }),
    });

    expect(result.current).toEqual(payload);
  });

  it("returns undefined when the flag has no payload", () => {
    const { result } = renderHook(() => useBootstrappedPayload("a-flag"), {
      wrapper: makeWrapper({ "a-flag": true }, {}),
    });

    expect(result.current).toBeUndefined();
  });
});
