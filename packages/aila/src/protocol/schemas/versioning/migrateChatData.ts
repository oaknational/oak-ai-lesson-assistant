import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import type { AilaPersistedChat } from "../../schema";
import { PartialLessonPlanSchema, chatSchema } from "../../schema";
import { migrateLessonPlan } from "./migrateLessonPlan";

// Minimal schema for raw chat input validation
const RawChatInputSchema = z
  .object({
    lessonPlan: z.record(z.unknown()), // Must be an object, let migrateLessonPlan validate structure
  })
  .passthrough();

export interface MigrateChatDataContext {
  id: string;
  userId: string;
  caller: string;
}

/**
 * Helper to migrate lesson plan quizzes in chat data before parsing
 */
export async function migrateChatData(
  rawChat: unknown,
  persistCallback: ((chatData: AilaPersistedChat) => Promise<void>) | null,
  context: MigrateChatDataContext,
): Promise<AilaPersistedChat> {
  if (typeof rawChat !== "object" || rawChat === null) {
    throw new Error("Invalid chat data format");
  }

  const parseResult = RawChatInputSchema.safeParse({
    ...rawChat,
    // Overwrite JSON IDs with trusted DB values
    id: context.id,
    userId: context.userId,
  });
  if (!parseResult.success) {
    throw new Error("Invalid chat data format", { cause: parseResult.error });
  }

  const validatedRawChat = parseResult.data;

  try {
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
      outputSchema: PartialLessonPlanSchema,
    });

    const finalChatData = migrationResult.wasMigrated
      ? { ...validatedRawChat, lessonPlan: migrationResult.lessonPlan }
      : validatedRawChat;

    const parsedChat = chatSchema.parse(finalChatData);
    return parsedChat;
  } catch (originalError) {
    const error = new Error(`${context.caller} :: Failed to parse chat`, {
      cause: originalError,
    });
    Sentry.captureException(error, {
      extra: {
        id: context.id,
        userId: context.userId,
        rawChat: validatedRawChat,
        zodError:
          originalError instanceof Error
            ? originalError.message
            : originalError,
      },
    });
    throw error;
  }
}
