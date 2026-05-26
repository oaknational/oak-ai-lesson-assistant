import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

const rateLimiter = new Ratelimit({
  redis: kv,
  prefix: "rateLimit:checkBan",
  limiter: Ratelimit.fixedWindow(5, "60 s"),
});

export async function checkRateLimit(ip: string): Promise<boolean> {
  const { success } = await rateLimiter.limit(ip);
  return success;
}
