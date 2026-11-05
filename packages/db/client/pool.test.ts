import { EventEmitter } from "node:events";

import {
  CONNECTION_TIMEOUT_MS,
  IDLE_TIMEOUT_MS,
  MAX_CONNECTIONS,
  createPool,
  createPoolConfig,
  keepAliveUntilIdle,
} from "./pool";

const limits = {
  connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
  idleTimeoutMillis: IDLE_TIMEOUT_MS,
  max: MAX_CONNECTIONS,
};

describe("createPoolConfig", () => {
  const url =
    "postgresql://user:pw@db.example.com:6432/app?sslmode=require&application_name=aila";

  it("leaves the URL alone when there's no CA", () => {
    expect(createPoolConfig(url)).toEqual({ connectionString: url, ...limits });
  });

  it("passes the CA and removes the URL's SSL settings, which would override it", () => {
    const config = createPoolConfig(
      `${url}&sslrootcert=/tmp/ca.pem&uselibpqcompat=true`,
      "PEM",
    );

    expect(config).toMatchObject({ ssl: { ca: "PEM" }, ...limits });
    const params = new URL(config.connectionString ?? "").searchParams;
    expect(params.has("sslmode")).toBe(false);
    expect(params.has("sslrootcert")).toBe(false);
    expect(params.has("uselibpqcompat")).toBe(false);
    expect(params.get("application_name")).toBe("aila");
  });

  it("applies the limits even without a URL", () => {
    expect(createPoolConfig(undefined, "PEM")).toEqual({
      connectionString: undefined,
      ...limits,
    });
  });
});

describe("keepAliveUntilIdle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const setup = () => {
    const pool = new EventEmitter();
    const settled: boolean[] = [];
    const keepAlive = jest.fn((promise: Promise<void>) => {
      const index = settled.push(false) - 1;
      void promise.then(() => {
        settled[index] = true;
      });
    });
    keepAliveUntilIdle(pool, keepAlive);
    return { pool, settled, keepAlive };
  };

  it("keeps the instance alive until just after the idle timeout", async () => {
    const { pool, settled, keepAlive } = setup();

    pool.emit("release");
    expect(keepAlive).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(IDLE_TIMEOUT_MS);
    expect(settled).toEqual([false]);

    await jest.advanceTimersByTimeAsync(100);
    expect(settled).toEqual([true]);
  });

  it("replaces the previous wait on each release, so only one is pending", async () => {
    const { pool, settled } = setup();

    pool.emit("release");
    await jest.advanceTimersByTimeAsync(5_000);
    pool.emit("release");
    await jest.advanceTimersByTimeAsync(0);
    expect(settled).toEqual([true, false]);

    await jest.advanceTimersByTimeAsync(IDLE_TIMEOUT_MS + 100);
    expect(settled).toEqual([true, true]);
  });
});

describe("createPool", () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it.each([
    ["on Vercel", "1", 1],
    ["elsewhere", undefined, 0],
  ])("keeps instances alive only %s", async (_, vercel, listeners) => {
    process.env = { ...env, VERCEL: vercel };
    const pool = createPool();

    expect(pool.listenerCount("release")).toBe(listeners);
    expect(pool.options.max).toBe(MAX_CONNECTIONS);
    await pool.end();
  });
});
