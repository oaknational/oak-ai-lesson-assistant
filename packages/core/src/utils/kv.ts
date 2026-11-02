import { Redis } from "@upstash/redis";

let client: Redis | undefined;

function getClient() {
  if (!client) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
      throw new Error(
        "Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN",
      );
    }
    client = new Redis({ url, token, enableTelemetry: false });
  }
  return client;
}

/**
 * Redis client for the Upstash database behind Vercel KV. It replaces
 * `kv` from the deprecated @vercel/kv and, like it, connects on first use,
 * so importing this module doesn't need the environment variables
 */
export const kv = new Proxy({} as Redis, {
  get(_target, property) {
    const redis = getClient();
    const value = Reflect.get(redis, property) as unknown;
    // Bind methods so they run against the client rather than the proxy
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(redis)
      : value;
  },
});
