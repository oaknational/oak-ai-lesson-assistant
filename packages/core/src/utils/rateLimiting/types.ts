type Unit = "ms" | "s" | "m" | "h" | "d";
export type Duration = `${number} ${Unit}` | `${number}${Unit}`;

// NOTE: Duplicates RateLimitInfo in packages/api/src/types.ts
export type RateLimitInfo = {
  isSubjectToRateLimiting: true;
  limit: number;
  remaining: number;
  reset: number;
};

export type RateLimiter = {
  check: (userId: string, options?: { rate: number }) => Promise<RateLimitInfo>;
  getRemaining: (userId: string) => Promise<number>;
  resetUsedTokens: (userId: string) => Promise<void>;
};
