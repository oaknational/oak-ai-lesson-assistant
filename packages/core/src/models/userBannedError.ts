export class UserBannedError extends Error {
  constructor(userId: string) {
    super(`User banned: ${userId}`);
  }
}
