import { prisma } from "@oakai/db/client";
import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { isTruthy } from "remeda";
import { z } from "zod";

import { AilaPersistedChatSchema } from "../../../aila/src/protocol/schema";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

function parseChatAndReportError({
  chat,
  id,
  caller,
}: {
  caller: string;
  chat: unknown;
  id: string;
}) {
  const parseResult = AilaPersistedChatSchema.safeParse(chat);

  if (!parseResult.success) {
    const error = new Error(`${caller} :: Failed to parse chat`);
    Sentry.captureException(error, {
      extra: {
        id,
        chat,
        zodError: parseResult.error.flatten(),
      },
    });
  }

  return parseResult.data;
}

export const chatsRouter = router({
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const { id } = input;

      const session = await prisma?.appSession.findUnique({
        where: { id, deletedAt: null },
      });

      if (!session) {
        return null;
      }
      const userIsOwner = session.userId === userId;

      if (!userIsOwner) {
        return null;
      }

      const parsedChat = parseChatAndReportError({
        id,
        caller: "chats.getById",
        chat: session.output,
      });

      return parsedChat;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;

    const sessions = await prisma?.appSession.findMany({
      where: {
        userId,
        appId: "lesson-planner",
        deletedAt: null,
      },
    });

    return sessions
      ?.map((session) => {
        const parsedChat = parseChatAndReportError({
          id: session.id,
          caller: "chats.getAll",
          chat: session.output,
        });

        return parsedChat;
      })
      .filter(isTruthy);
  }),
  deleteById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const { id } = input;

      await ctx.prisma.appSession.deleteMany({
        where: {
          id,
          appId: "lesson-planner",
          userId,
        },
      });
    }),
  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.auth;

    await ctx.prisma.appSession.deleteMany({
      where: {
        userId,
        appId: "lesson-planner",
      },
    });
  }),
  share: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const { id } = input;

      const session = await prisma?.appSession.findUnique({
        where: {
          id,
          userId,
          appId: "lesson-planner",
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      const chat = parseChatAndReportError({
        id,
        caller: "chats.share",
        chat: session.output,
      });

      const sharedChat = {
        ...chat,
        isShared: true,
      };

      await prisma?.appSession.update({
        where: { id },
        data: { output: sharedChat },
      });

      return sharedChat;
    }),
  getShared: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;

      const session = await prisma?.appSession.findUnique({
        where: { id, appId: "lesson-planner" },
      });

      const chat = parseChatAndReportError({
        id,
        caller: "chats.getShared",
        chat: session?.output,
      });

      if (!chat?.isShared) {
        return null;
      }

      return chat;
    }),
});
