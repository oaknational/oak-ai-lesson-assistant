import { upgradeQuizzes } from "@oakai/aila/src/protocol/schemas/quiz/conversion/lessonPlanQuizMigrator";
import { demoUsers } from "@oakai/core";
import { rateLimits } from "@oakai/core/src/utils/rateLimiting";
import type { Prisma, PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import type { SignedInAuthObject } from "@clerk/backend/internal";
import { clerkClient } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { isTruthy } from "remeda";
import { z } from "zod";

import { getSessionModerations } from "../../../aila/src/features/moderation/getSessionModerations";
import { generateChatId } from "../../../aila/src/helpers/chat/generateChatId";
import type { AilaPersistedChat } from "../../../aila/src/protocol/schema";
import { chatSchema } from "../../../aila/src/protocol/schema";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";
import { checkMutationPermissions } from "./helpers/checkMutationPermissions";

const log = aiLogger("appSessions");

function userIsOwner(entity: { userId: string }, auth: SignedInAuthObject) {
  return entity.userId === auth.userId;
}

function parseChatAndReportError({
  sessionOutput,
  id,
  userId,
}: {
  sessionOutput: Prisma.JsonValue;
  id: string;
  userId: string;
}) {
  if (typeof sessionOutput !== "object") {
    throw new Error("sessionOutput is not an object");
  }

  const parseResult = chatSchema.safeParse({
    ...sessionOutput,
    userId,
    id,
  });

  if (!parseResult.success) {
    const error = new Error("Failed to parse chat");
    log.error(error);
    Sentry.captureException(error, {
      extra: {
        id,
        userId,
        sessionOutput,
        zodError: parseResult.error.flatten(),
      },
    });
  }

  return parseResult.data;
}

export async function getChat(id: string, prisma: PrismaClientWithAccelerate) {
  const chatRecord = await prisma.appSession.findUnique({
    where: {
      id: id,
      deletedAt: null,
    },
  });
  if (!chatRecord) {
    return undefined;
  }

  // Upgrade V1 quizzes to V2 if needed
  const upgradeResult = await upgradeQuizzes({
    data: chatRecord.output,
    persistUpgrade: async (upgradedData) => {
      await prisma.appSession.update({
        where: { id },
        data: { output: upgradedData },
      });
    },
  });

  const chat = parseChatAndReportError({
    id,
    userId: chatRecord.userId,
    sessionOutput: upgradeResult.data,
  });

  return chat;
}

export const appSessionsRouter = router({
  getModerations: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;

      const moderations = await getSessionModerations(id);
      return moderations
        .filter((moderation) => userIsOwner(moderation, ctx.auth))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }),
  getChat: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const chat = await getChat(id, ctx.prisma);

      if (!chat) {
        return null;
      }

      if (!userIsOwner(chat, ctx.auth)) {
        return null;
      }

      return chat;
    }),
  create: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        message: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { message, appId } = input;
      const { userId } = ctx.auth;

      await checkMutationPermissions(userId);

      const chatId = generateChatId();

      const output: AilaPersistedChat = {
        id: chatId,
        path: `/aila/lesson/${chatId}`,
        title: "",
        topic: "",
        userId,
        lessonPlan: {},
        createdAt: Date.now(),
        messages: [],
      };

      if (message) {
        output.startingMessage = message;
      }

      const appSession = {
        data: {
          id: chatId,
          appId,
          userId,
          output,
        },
      };
      // Create a blank chat
      // #TODO use the Aila package?
      const session = await ctx.prisma.appSession.create(appSession);
      return session;
    }),

  remainingLimit: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;
    const clerkUser = await clerkClient.users.getUser(userId);

    const isDemoUser = demoUsers.isDemoUser(clerkUser);

    if (!isDemoUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not a demo user",
      });
    }

    const remaining = await rateLimits.appSessions.demo.getRemaining(userId);
    return { remaining };
  }),
  getSidebarChats: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;

    /**
     * Context for $queryRaw usage:
     * @hannah-bethclark experienced an issue where chat history was empty.
     * This was caused by Prisma's response size limit of 5mb
     * @see https://www.prisma.io/docs/accelerate/limitations#response-size-limit
     * Since the JSONB column 'output' is so large, we need to use $queryRaw to
     * get only the data we need.
     * @see https://github.com/prisma/prisma/issues/2431
     *
     * Part of database refactoring will include not storing all out chat data
     * in a single JSONB column, which will remove the need for this workaround.
     */
    const sessions = await ctx.prisma.$queryRaw`
      SELECT
        id,
        "updated_at" as "updatedAt",
        output->>'title' as title,
        output->'isShared' as "isShared"
      FROM
        "app_sessions"
      WHERE
        "user_id" = ${userId} AND "app_id" = 'lesson-planner'
        AND "deleted_at" IS NULL
      ORDER BY
        "updated_at" DESC
    `;

    if (!Array.isArray(sessions)) {
      return [];
    }

    return sessions
      .map((session) => {
        try {
          return z
            .object({
              id: z.string(),
              title: z.string(),
              isShared: z.boolean().nullish(),
              updatedAt: z.date(),
            })
            .parse(session);
        } catch (error) {
          Sentry.captureException(error, {
            extra: {
              session,
            },
          });
          return null;
        }
      })
      .filter(isTruthy);
  }),
  deleteChatById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const { id } = input;

      await ctx.prisma.appSession.update({
        where: {
          id,
          appId: "lesson-planner",
          userId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }),
  deleteAllChats: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.auth;
    await ctx.prisma.appSession.updateMany({
      where: {
        userId,
        appId: "lesson-planner",
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }),
  shareChat: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const { id } = input;

      const session = await ctx.prisma?.appSession.findUnique({
        where: {
          id,
          userId,
          appId: "lesson-planner",
          deletedAt: null,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      // Upgrade V1 quizzes to V2 if needed (but don't persist yet)
      const upgradeResult = await upgradeQuizzes({
        data: session.output,
        persistUpgrade: null,
      });

      const chat = parseChatAndReportError({
        id,
        userId: session.userId,
        sessionOutput: upgradeResult.data,
      });

      if (!chat) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to parse chat",
        });
      }

      const sharedChat = {
        ...chat,
        isShared: true,
      };

      // Single update that includes both upgrade (if needed) and sharing
      await ctx.prisma?.appSession.update({
        where: { id },
        data: { output: sharedChat },
      });

      return sharedChat;
    }),
  getSharedChat: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;

      const chat = await getChat(id, ctx.prisma);

      if (!chat?.isShared) {
        return null;
      }

      return chat;
    }),
});
