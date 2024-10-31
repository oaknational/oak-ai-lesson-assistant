import type { LessonDeepPartial } from "@oakai/exports";

export type ExportsHookProps<T = unknown> = T & {
  onStart: () => void;
  lesson: LessonDeepPartial;
  chatId: string;
  /**
   * Message ID is of the last assistant message. It should never be undefined, but technically it can be.
   */
  messageId: string | undefined;
  active: boolean;
};
