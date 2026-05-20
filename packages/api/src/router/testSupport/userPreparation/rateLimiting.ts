import { rateLimits } from "@oakai/core/src/utils/rateLimiting";
import type { RateLimiter } from "@oakai/core/src/utils/rateLimiting/types";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("testing");

const STANDARD_GENERATION_LIMITER = rateLimits.generations.standard;
const RESET_RATE_LIMITERS = [
  rateLimits.generations.standard,
  rateLimits.generations.demo,
  rateLimits.appSessions.demo,
  rateLimits.teachingMaterialSessions.demo,
  rateLimits.teachingMaterial.standard,
  rateLimits.teachingMaterial.demo,
];

const waitForRemaining = async (
  rateLimiter: RateLimiter,
  userId: string,
  remaining: number,
) => {
  const startedAt = Date.now();
  const timeoutMs = 5000;
  let actualRemaining: number | undefined;

  while (Date.now() - startedAt < timeoutMs) {
    actualRemaining = await rateLimiter.getRemaining(userId);
    if (actualRemaining === remaining) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(
    `Rate limit reset did not settle for ${userId}: expected ${remaining}, got ${actualRemaining}`,
  );
};

export const setRateLimitTokens = async (userId: string, count: number) => {
  await Promise.all(
    RESET_RATE_LIMITERS.map((rateLimiter) =>
      rateLimiter.resetUsedTokens(userId),
    ),
  );

  if (count > 0) {
    const result = await STANDARD_GENERATION_LIMITER.check(userId, {
      rate: count,
    });
    if (result.isSubjectToRateLimiting) {
      log.info(`User has ${result.remaining} remaining generations`);
      await waitForRemaining(
        STANDARD_GENERATION_LIMITER,
        userId,
        result.remaining,
      );
    }
  }
};
