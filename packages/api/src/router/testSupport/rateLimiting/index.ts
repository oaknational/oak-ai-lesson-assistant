import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

if (!process.env.RATELIMIT_GENERATIONS_PER_24H) {
  throw new Error("RATELIMIT_GENERATIONS_PER_24H is required");
}
const GENERATIONS_PER_24H = parseInt(
  process.env.RATELIMIT_GENERATIONS_PER_24H,
  10,
);

const rateLimiter = new Ratelimit({
  redis: kv,
  prefix: "rateLimit:generations:standard",
  limiter: Ratelimit.slidingWindow(GENERATIONS_PER_24H, "24 h"),
});

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const setRateLimitTokens = async (userId: string, count: number) => {
  await rateLimiter.resetUsedTokens(userId);
  if (count > 0) {
    const { remaining, pending } = await rateLimiter.limit(userId, {
      rate: count,
    });
    await sleep(5000);
    console.log({ userId });
    console.log(`Test support: User has ${remaining} remaining generations`);
    await pending;
    console.log(`Test support: User has ${remaining} remaining generations`);
  }
  const { remaining, reset } = await rateLimiter.getRemaining(userId);
  console.log(`Test support: User has ${remaining} remaining generations`);
  console.log(`Test support: Resets at ${reset}`);
};
