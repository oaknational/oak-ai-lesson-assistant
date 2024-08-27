import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@oakai/db";
import { kv } from "@vercel/kv";
import { z } from "zod";

import { LessonPlanSchemaWhilstStreaming } from "../../../../aila/src/protocol/schema";
import { inngest } from "../../client";
import { kvChatsToPrismaSchema } from "./kvChatsToPrisma.schema";

const chatSchema = z
  .object({
    id: z.string(),
    path: z.string(),
    title: z.string(),
    userId: z.string(),
    lessonPlan: LessonPlanSchemaWhilstStreaming,
    sharePath: z.string().optional(),
    createdAt: z.union([z.date(), z.number()]),
    messages: z.array(
      z
        .object({
          id: z.string().optional(),
          content: z.string(),
          role: z.union([
            z.literal("function"),
            z.literal("data"),
            z.literal("user"),
            z.literal("system"),
            z.literal("assistant"),
            z.literal("tool"),
          ]),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const kvChatsToPrisma = inngest.createFunction(
  {
    name: "Migrate chats in kv to prisma AppSessions",
    id: "kv-chats-to-prisma",
  },
  { event: "app/migrations.kvChatsToPrisma" },
  async ({ event, step }) => {
    const args = kvChatsToPrismaSchema.data.parse(event.data);
    const DRY_RUN = args.dryRun;

    if (DRY_RUN) {
      console.log("Running in dry run mode");
    }

    const limit = 50;
    let offset: number | null = 0;

    while (offset !== null) {
      offset = await step.run("Move KV chats to Prisma", async () => {
        if (offset === null) {
          return null;
        }

        const clerkResponse = await clerkClient.users.getUserList({
          limit,
          offset,
        });

        const users = clerkResponse.data;
        console.log(`Found ${users.length} users`);

        if (users.length === 0) {
          return null;
        }

        for (const user of users) {
          console.log(user.id, "- Migrating chats");

          const chatIds: string[] = await kv.zrange(
            `user:chat:${user.id}`,
            0,
            -1,
          );

          if (chatIds.length === 0) {
            console.log(user.id, "- No chats to migrate for user");
            continue;
          }

          const pipeline = kv.pipeline();

          for (const chat of chatIds) {
            pipeline.hgetall(chat);
          }

          const results: {
            id: string;
            userId: string;
          }[] = await pipeline.exec();

          for (const chat of results) {
            if (!chat) {
              continue;
            }

            const appSession = await prisma.appSession.findUnique({
              where: {
                id: chat.id,
              },
            });

            if (appSession) {
              console.log(chat.id, "- AppSession exists in prisma");
              console.log(chat.id, "- Deleting chat from KV");
              if (!DRY_RUN) {
                await kv.zrem(`user:chat:${user.id}`, `chat:${chat.id}`);
                await kv.del(chat.id);
              }
              continue;
            }

            const parseResult = chatSchema.safeParse(chat);
            if (parseResult.success === false) {
              console.log(
                chat.id,
                "- Chat schema validation failed. Skipping import",
                parseResult.error.issues,
              );
              continue;
            }

            console.log(chat.id, "- Creating AppSession for chat");
            if (!DRY_RUN) {
              await prisma.appSession.create({
                data: {
                  id: chat.id,
                  userId: chat.userId,
                  appId: "lesson-planner",
                  output: chat,
                },
              });
            }

            console.log(chat.id, "- Deleting chat from KV");
            if (!DRY_RUN) {
              await kv.zrem(`user:chat:${user.id}`, `chat:${chat.id}`);
              await kv.del(chat.id);
            }
          }
        }

        return offset + limit;
      });
    }
  },
);
