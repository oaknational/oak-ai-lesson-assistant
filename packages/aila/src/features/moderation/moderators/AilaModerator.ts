import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

export type AilaModeratorContext = {
  sessionId?: string;
  messageId?: string;
};

export abstract class AilaModerator {
  protected _userId: string | undefined;
  protected _chatId: string | undefined;

  constructor({ userId, chatId }: { userId?: string; chatId?: string }) {
    this._userId = userId;
    this._chatId = chatId;
  }
  abstract moderate(
    input: string,
    context?: AilaModeratorContext,
  ): Promise<ModerationResult | undefined>;
}

export class AilaModerationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ModerationError";
  }
}
