import {
  posthogAiBetaServerClient,
  refreshFlagDefinitionsIfStale,
} from "@oakai/core/src/analytics/posthogAiBetaServerClient";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";

import { serverSideFeatureFlag } from "./serverSideFeatureFlag";

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  clerkClient: jest.fn(),
}));

jest.mock("@vercel/kv", () => ({
  kv: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock("@oakai/core/src/analytics/posthogAiBetaServerClient", () => ({
  posthogAiBetaServerClient: {
    isFeatureEnabled: jest.fn(),
  },
  refreshFlagDefinitionsIfStale: jest.fn(),
}));

const mockedAuth = jest.mocked(auth);
const mockedClerkClient = jest.mocked(clerkClient);
const mockedKvGet = jest.mocked(kv.get);
const mockedKvSet = jest.mocked(kv.set);
const mockedIsFeatureEnabled = jest.mocked(
  posthogAiBetaServerClient.isFeatureEnabled,
);
const mockedRefresh = jest.mocked(refreshFlagDefinitionsIfStale);

describe("serverSideFeatureFlag", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedAuth.mockResolvedValue({ userId: "user_123" } as Awaited<
      ReturnType<typeof auth>
    >);
  });

  it("returns true for boolean true cache hits", async () => {
    mockedKvGet.mockResolvedValue(true);

    await expect(serverSideFeatureFlag("agentic-aila-nov-25")).resolves.toBe(
      true,
    );

    expect(mockedKvGet).toHaveBeenCalledWith(
      "feature_flag:agentic-aila-nov-25:user_123",
    );
    expect(mockedIsFeatureEnabled).not.toHaveBeenCalled();
    expect(mockedClerkClient).not.toHaveBeenCalled();
    // No point refreshing definitions we aren't going to evaluate against.
    expect(mockedRefresh).not.toHaveBeenCalled();
  });

  it("returns false for boolean false cache hits", async () => {
    mockedKvGet.mockResolvedValue(false);

    await expect(serverSideFeatureFlag("agentic-aila-nov-25")).resolves.toBe(
      false,
    );

    expect(mockedIsFeatureEnabled).not.toHaveBeenCalled();
    expect(mockedClerkClient).not.toHaveBeenCalled();
  });

  it("stores boolean results from PostHog in KV", async () => {
    mockedKvGet.mockResolvedValue(null);
    mockedIsFeatureEnabled.mockResolvedValue(true);
    mockedClerkClient.mockResolvedValue({
      users: {
        getUser: jest.fn().mockResolvedValue({
          emailAddresses: [{ emailAddress: "test@example.com" }],
        }),
      },
    } as unknown as Awaited<ReturnType<typeof clerkClient>>);

    await expect(serverSideFeatureFlag("agentic-aila-nov-25")).resolves.toBe(
      true,
    );

    expect(mockedKvSet).toHaveBeenCalledWith(
      "feature_flag:agentic-aila-nov-25:user_123",
      true,
      { ex: 60 },
    );
  });

  it("refreshes stale flag definitions before evaluating on a cache miss", async () => {
    mockedKvGet.mockResolvedValue(null);
    mockedIsFeatureEnabled.mockResolvedValue(true);
    mockedClerkClient.mockResolvedValue({
      users: {
        getUser: jest.fn().mockResolvedValue({
          emailAddresses: [{ emailAddress: "test@example.com" }],
        }),
      },
    } as unknown as Awaited<ReturnType<typeof clerkClient>>);

    await serverSideFeatureFlag("agentic-aila-nov-25");

    expect(mockedRefresh).toHaveBeenCalledTimes(1);
    expect(mockedRefresh.mock.invocationCallOrder[0]).toBeLessThan(
      mockedIsFeatureEnabled.mock.invocationCallOrder[0]!,
    );
  });
});
