export class RateLimitExceededError extends Error {
  public readonly userId: string;
  public readonly limit: number;
  public readonly reset: number;

  constructor(userId: string, limit: number, reset: number) {
    super("Rate limit exceeded");
    this.name = "RateLimitExceededError";
    this.userId = userId;
    this.limit = limit;
    this.reset = reset;
  }
}
