import { standardRateLimit } from "@oakai/core/src/utils/rateLimiting/rateLimit";
import { aiLogger } from "@oakai/logger";

// import { Ratelimit } from "@upstash/ratelimit";
// import { kv } from "@vercel/kv";

// if (!process.env.RATELIMIT_GENERATIONS_PER_24H) {
//   throw new Error("RATELIMIT_GENERATIONS_PER_24H is required");
// }
// const GENERATIONS_PER_24H = parseInt(
//   process.env.RATELIMIT_GENERATIONS_PER_24H,
//   10,
// );

const log = aiLogger("testing");

const rateLimiter = standardRateLimit;

// const rateLimiter = new Ratelimit({
//   redis: kv,
//   prefix: "rateLimit:generations:standard",
//   limiter: Ratelimit.slidingWindow(GENERATIONS_PER_24H, "24 h"),
// });

export const setRateLimitTokens = async (userId: string, count: number) => {
  log.info({ userId });
  await rateLimiter.resetUsedTokens(userId);
  log.info("Reset rate limit");
  if (count > 0) {
    const { remaining, pending } = await rateLimiter.limit(userId, {
      rate: count,
    });
    log.info(`Test support: User has ${remaining} remaining generations`);
    await pending;
  }
};
