import { z } from "zod";

import type { AilaPersistedChat } from "../../schema";
import { chatSchema } from "../../schema";
import { migrateLessonPlan } from "./migrateLessonPlan";

// Minimal schema for raw chat input validation
const RawChatInputSchema = z
  .object({
    lessonPlan: z.record(z.unknown()), // Must be an object, let migrateLessonPlan validate structure
  })
  .passthrough();

/**
 * Helper to migrate lesson plan quizzes in chat data before parsing
 */
export async function migrateChatData(
  rawChat: unknown,
  persistCallback: ((chatData: AilaPersistedChat) => Promise<void>) | null,
): Promise<AilaPersistedChat> {
  // Schema-based validation with better error messages
  const parseResult = RawChatInputSchema.safeParse(rawChat);
  if (!parseResult.success) {
    throw new Error("Invalid chat data format", { cause: parseResult.error });
  }

  const validatedRawChat = parseResult.data;

  const migrationResult = await migrateLessonPlan({
    lessonPlan: validatedRawChat.lessonPlan,
    persistMigration: async (migratedLessonPlan) => {
      const updatedChat = {
        ...validatedRawChat,
        lessonPlan: migratedLessonPlan,
      };
      const parsedChat = chatSchema.parse(updatedChat);
      await persistCallback?.(parsedChat);
    },
  });

  const finalChatData = migrationResult.wasMigrated
    ? { ...validatedRawChat, lessonPlan: migrationResult.lessonPlan }
    : validatedRawChat;

  const parsedChat = chatSchema.parse(finalChatData);
  return parsedChat;
}
