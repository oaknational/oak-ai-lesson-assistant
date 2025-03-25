import { rateLimits } from "@oakai/core/src/utils/rateLimiting";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("testing");

// NOTE: The ratelimiter has an in-memory cache, so we reset the same instance
const rateLimiter = rateLimits.generations.standard;

export const setRateLimitTokens = async (userId: string, count: number) => {
  await rateLimiter.resetUsedTokens(userId);
  if (count > 0) {
    const result = await rateLimiter.check(userId, {
      rate: count,
    });
    if (result.isSubjectToRateLimiting) {
      log.info(`User has ${result.remaining} remaining generations`);
    }
  }
};
