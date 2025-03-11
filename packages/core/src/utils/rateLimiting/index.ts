import { fixedWindowRateLimiter } from "./fixedWindowRateLimiter";
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
    standard: userBasedRateLimiter({
      prefix: "rateLimit:generations:standard",
      limit: (isOakUser, privateMetadata) => {
        const customRateLimit = privateMetadata["customRateLimit"];
        if (typeof customRateLimit === "number") {
          return customRateLimit;
        }
        if (isOakUser) {
          return 1000;
        }
        return GENERATIONS_PER_24H;
      },
      interval: "24 h",
      refillRate: 0.75,
    }),
    demo: fixedWindowRateLimiter({
      prefix: "rateLimit:generations:demo",
      limit: DEMO_GENERATIONS_PER_30D,
      window: "30 d",
    }),
  },
  appSessions: {
    demo: fixedWindowRateLimiter({
      prefix: "rateLimit:lessons:demo",
      limit: DEMO_APP_SESSIONS_PER_30D,
      window: "30 d",
    }),
  },
} as const;
