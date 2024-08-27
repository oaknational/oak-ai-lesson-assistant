import { Ratelimit as RateLimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

import { userBasedRateLimiter } from "./userBasedRateLimiter";

if (!process.env.RATELIMIT_GENERATIONS_PER_24H) {
  throw new Error("RATELIMIT_GENERATIONS_PER_24H is required");
}
const GENERATIONS_PER_24H = parseInt(
  process.env.RATELIMIT_GENERATIONS_PER_24H,
  10,
);

if (!process.env.RATELIMIT_DEMO_GENERATIONS_PER_30D) {
  throw new Error("RATELIMIT_DEMO_GENERATIONS_PER_30D is required");
}
const DEMO_GENERATIONS_PER_30D = parseInt(
  process.env.RATELIMIT_DEMO_GENERATIONS_PER_30D,
  10,
);

if (!process.env.NEXT_PUBLIC_RATELIMIT_DEMO_APP_SESSIONS_PER_30D) {
  throw new Error(
    "NEXT_PUBLIC_RATELIMIT_DEMO_APP_SESSIONS_PER_30D is required",
  );
}
const DEMO_APP_SESSIONS_PER_30D = parseInt(
  process.env.NEXT_PUBLIC_RATELIMIT_DEMO_APP_SESSIONS_PER_30D,
  10,
);

export const rateLimits = {
  generations: {
    standard: userBasedRateLimiter(
      new RateLimit({
        redis: kv,
        prefix: "rateLimit:generations:standard",
        limiter: RateLimit.slidingWindow(GENERATIONS_PER_24H, "24 h"),
      }),
    ),
    demo: userBasedRateLimiter(
      new RateLimit({
        redis: kv,
        prefix: "rateLimit:generations:demo",
        limiter: RateLimit.slidingWindow(DEMO_GENERATIONS_PER_30D, "30 d"),
      }),
    ),
  },
  appSessions: {
    demo: userBasedRateLimiter(
      new RateLimit({
        redis: kv,
        prefix: "rateLimit:lessons:demo",
        limiter: RateLimit.slidingWindow(DEMO_APP_SESSIONS_PER_30D, "30 d"),
      }),
    ),
  },
} as const;
