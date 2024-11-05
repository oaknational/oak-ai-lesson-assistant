import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

export abstract class AilaModerator {
  private _userId: string | undefined;
  private _chatId: string | undefined;

  constructor({ userId, chatId }: { userId?: string; chatId?: string }) {
    this._userId = userId;
    this._chatId = chatId;
  }
  abstract moderate(input: string): Promise<ModerationResult | undefined>;
}

export class AilaModerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModerationError";
  }
}
