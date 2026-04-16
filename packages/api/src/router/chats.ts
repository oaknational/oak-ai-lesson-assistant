import { migrateChatData } from "@oakai/aila/src/protocol/schemas/versioning/migrateChatData";
import { prisma } from "@oakai/db/client";

import { TRPCError } from "@trpc/server";
import { isTruthy } from "remeda";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

async function parseChatAndReportError({
  chat,
  id,
  caller,
  userId,
}: {
  caller: string;
  chat: unknown;
  id: string;
  userId: string;
}) {
  const parsedChat = await migrateChatData(
    chat,
    async (upgradedData) => {
      await prisma.appSession.update({
        where: { id },
        data: { output: upgradedData },
      });
    },
    {
      id,
      userId,
      caller,
    },
  );

  return parsedChat;
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

      const parsedChat = await parseChatAndReportError({
        id,
        caller: "chats.getById",
        chat: session.output,
        userId: session.userId,
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

    const parsedChats = await Promise.all(
      sessions?.map((session) => {
        const parsedChatPromise = parseChatAndReportError({
          id: session.id,
          caller: "chats.getAll",
          chat: session.output,
          userId: session.userId,
        }).catch(() => null); // Errors already reported

        return parsedChatPromise;
      }),
    );

    return parsedChats.filter(isTruthy);
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

      const chat = await parseChatAndReportError({
        id,
        caller: "chats.share",
        chat: session.output,
        userId: session.userId,
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

      const chat = await parseChatAndReportError({
        id,
        caller: "chats.getShared",
        chat: session?.output,
        userId: session?.userId ?? "",
      });

      if (!chat?.isShared) {
        return null;
      }

      return chat;
    }),
});
