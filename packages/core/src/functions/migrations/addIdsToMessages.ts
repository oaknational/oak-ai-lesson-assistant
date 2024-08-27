import { Prisma, prisma } from "@oakai/db";
import crypto from "crypto";
import { z } from "zod";

import { inngest } from "../../client";
import { addIdsToMessagesSchema } from "./addIdsToMessages.schema";

const chatSchema = z
  .object({
    messages: z.array(
      z
        .object({
          id: z.string().optional(),
          content: z.string(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

/**
 * Generate a unique message ID based on the message content.
 */
export function getMessageId(message: { content: string }) {
  return crypto
    .createHash("sha256")
    .update(message.content)
    .digest("hex")
    .slice(0, 16);
}

export const addIdsToMessages = inngest.createFunction(
  {
    name: "Add ids to messages in AppSessions",
    id: "add-ids-to-messages",
  },
  { event: "app/migrations.addIdsToMessages" },
  async ({ event, step }) => {
    const args = addIdsToMessagesSchema.data.parse(event.data);
    const DRY_RUN = args.dryRun;

    if (DRY_RUN) {
      console.log("Running in dry run mode");
    }

    async function migrateAppSession(appSession: {
      id: string;
      output: Prisma.JsonValue;
    }) {
      const parseResult = chatSchema.safeParse(appSession.output);
      if (!parseResult.success) {
        console.log(appSession.id, "- Invalid chat schema");
        console.error(parseResult.error.issues);
        return;
      }

      const chat = parseResult.data;
      const messagesWithoutIds = chat.messages.filter((message) => !message.id);

      if (messagesWithoutIds.length === 0) {
        console.log(appSession.id, "- No messages without ids");
        return;
      }

      console.log(appSession.id, "- Found messages without ids");

      messagesWithoutIds.forEach((message, index) => {
        const id = getMessageId(message);
        console.log(appSession.id, "- Adding id to message", index, id);
        message.id = id;
      });

      console.log(appSession.id, "- Updating appSession with ids");
      if (!DRY_RUN) {
        await prisma.appSession.update({
          where: {
            id: appSession.id,
          },
          data: {
            output: chat,
          },
        });
      }
    }

    let cursor: string | null = null;

    while (true) {
      cursor = await step.run("Process page", async () => {
        console.log("Cursor:", cursor);
        const appSessions: Array<{ id: string; output: Prisma.JsonValue }> =
          await prisma.appSession.findMany({
            where: {
              appId: "lesson-planner",
              output: { not: Prisma.JsonNull },
            },
            select: {
              id: true,
              output: true,
            },
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : undefined),
            take: 20,
            orderBy: {
              id: "asc",
            },
          });

        const last = appSessions[appSessions.length - 1];
        if (!last) {
          console.log("No more appSessions");
          return null;
        }
        console.log(`Found ${appSessions.length} appSessions`);

        await Promise.all(
          appSessions.map((appSession) => migrateAppSession(appSession)),
        );

        return last.id;
      });

      if (!cursor) {
        break;
      }
    }

    console.log("Migration complete");
  },
);
