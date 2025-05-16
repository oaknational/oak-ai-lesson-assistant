import { rateLimits } from "@oakai/core/src/utils/rateLimiting";

import type { RateLimitInfo } from "types";

export const checkRateLimit = async (
  rateLimit: RateLimitInfo,
  userId: string,
) => {
  if (rateLimit.isSubjectToRateLimiting) {
    const userHasRemainingTokens = rateLimit.remaining < rateLimit.limit;
  }
  const remainingSessions =
    await rateLimits.appSessions.demo.getRemaining(userId);
};
