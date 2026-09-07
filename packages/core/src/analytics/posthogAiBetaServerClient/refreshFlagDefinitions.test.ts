import type { PostHog } from "posthog-node";

// The client module asserts on this at import time, so it has to be set before the
// dynamic import below.
process.env.POSTHOG_FEATURE_FLAGS_API_KEY ??= "phx_test";

let posthogAiBetaServerClient: PostHog;
let refreshFlagDefinitionsIfStale: () => Promise<void>;
let REFRESH_INTERVAL_MS: number;

beforeAll(async () => {
  const mod = await import("./index");
  posthogAiBetaServerClient = mod.posthogAiBetaServerClient;
  refreshFlagDefinitionsIfStale = mod.refreshFlagDefinitionsIfStale;
  REFRESH_INTERVAL_MS = mod.REFRESH_INTERVAL_MS;

  // Installed once: the clock has to move forward across the whole file, because
  // the throttle timestamp is module state shared by every test in it.
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  // Start each test well clear of the previous one's refresh.
  jest.advanceTimersByTime(REFRESH_INTERVAL_MS * 10);
});

const mockReload = () =>
  jest
    .spyOn(posthogAiBetaServerClient, "reloadFeatureFlags")
    .mockResolvedValue(undefined);

describe("refreshFlagDefinitionsIfStale", () => {
  it("refreshes when the definitions are stale", async () => {
    const reload = mockReload();

    await refreshFlagDefinitionsIfStale();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does nothing on a second call within the interval", async () => {
    const reload = mockReload();

    await refreshFlagDefinitionsIfStale();
    jest.advanceTimersByTime(REFRESH_INTERVAL_MS - 1);
    await refreshFlagDefinitionsIfStale();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("refreshes again once the interval has passed", async () => {
    const reload = mockReload();

    await refreshFlagDefinitionsIfStale();
    jest.advanceTimersByTime(REFRESH_INTERVAL_MS);
    await refreshFlagDefinitionsIfStale();

    expect(reload).toHaveBeenCalledTimes(2);
  });

  // Would fail if the timestamp were recorded after awaiting the refresh: every
  // request in flight at the same moment would trigger its own.
  it("refreshes once when concurrent requests arrive together", async () => {
    const reload = mockReload();

    await Promise.all([
      refreshFlagDefinitionsIfStale(),
      refreshFlagDefinitionsIfStale(),
      refreshFlagDefinitionsIfStale(),
    ]);

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("swallows a failed refresh so the page still renders", async () => {
    const reload = jest
      .spyOn(posthogAiBetaServerClient, "reloadFeatureFlags")
      .mockRejectedValue(new Error("PostHog is down"));

    await expect(refreshFlagDefinitionsIfStale()).resolves.toBeUndefined();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("waits out the interval after a failure rather than retrying every request", async () => {
    const reload = jest
      .spyOn(posthogAiBetaServerClient, "reloadFeatureFlags")
      .mockRejectedValue(new Error("PostHog is down"));

    await refreshFlagDefinitionsIfStale();
    await refreshFlagDefinitionsIfStale();

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
