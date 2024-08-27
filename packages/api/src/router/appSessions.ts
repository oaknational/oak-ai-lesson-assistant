import { SignedInAuthObject } from "@clerk/backend/internal";
import { clerkClient } from "@clerk/nextjs/server";
import { demoUsers } from "@oakai/core";
import { rateLimits } from "@oakai/core/src/utils/rateLimiting/rateLimit";
import { RateLimitExceededError } from "@oakai/core/src/utils/rateLimiting/userBasedRateLimiter";
import { Prisma, PrismaClientWithAccelerate } from "@oakai/db";
import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { isTruthy } from "remeda";
import { z } from "zod";

import { getSessionModerations } from "../../../aila/src/features/moderation/getSessionModerations";
import {
  AilaPersistedChat,
  chatSchema,
} from "../../../aila/src/protocol/schema";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

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
    throw new Error(`sessionOutput is not an object`);
  }
  const parseResult = chatSchema.safeParse({
    ...sessionOutput,
    userId,
    id,
  });

  if (!parseResult.success) {
    const error = new Error(`Failed to parse chat`);
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

async function checkMutationPermissions(userId: string) {
  const clerkUser = await clerkClient.users.getUser(userId);
  if (clerkUser.banned) {
    throw new Error("User is banned");
  }

  if (demoUsers.isDemoUser(clerkUser)) {
    try {
      await rateLimits.appSessions.demo.check(userId);
    } catch (e) {
      if (e instanceof RateLimitExceededError) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded",
          cause: e,
        });
      }
      throw e;
    }
  }
}

export async function getChat(id: string, prisma: PrismaClientWithAccelerate) {
  const chatRecord = await prisma.appSession.findUnique({
    where: {
      id: id,
    },
  });
  if (!chatRecord) {
    return undefined;
  }

  return parseChatAndReportError({
    id,
    userId: chatRecord.userId,
    sessionOutput: chatRecord.output,
  });
}

export const appSessionsRouter = router({
  getModerations: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;

      const moderations = await getSessionModerations(id);
      return moderations.filter((moderation) =>
        userIsOwner(moderation, ctx.auth),
      );
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

      const id = nanoid(16);

      const output: AilaPersistedChat = {
        id,
        path: `/aila/${id}`,
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
          id: nanoid(16),
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
  modifySection: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        messageId: z.string(),
        textForMod: z.string(),
        action: z.enum([
          "MAKE_IT_HARDER",
          "MAKE_IT_EASIER",
          "SHORTEN_CONTENT",
          "ADD_MORE_DETAIL",
          "OTHER",
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.auth;
      try {
        const response = await ctx.prisma.ailaUserModification.create({
          data: {
            userId,
            ...input,
          },
        });
        return response;
      } catch (error) {
        console.log(error);
        return error;
      }
    }),
  flagSection: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        messageId: z.string(),
        flagType: z.enum([
          "INAPPROPRIATE",
          "INACCURATE",
          "TOO_HARD",
          "TOO_EASY",
          "OTHER",
        ]),
        userComment: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // return "hello";
      const { chatId, messageId, flagType, userComment } = input;
      const { userId } = ctx.auth;
      try {
        const response = await ctx.prisma.ailaUserFlag.create({
          data: {
            userId,
            chatId,
            messageId,
            flagType,
            userComment,
          },
        });

        return response;
      } catch (error) {
        console.log(error);
        return error;
      }
    }),
  getSidebarChats: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;

    const sessions = await ctx.prisma?.appSession.findMany({
      where: {
        userId,
        appId: "lesson-planner",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return sessions
      ?.map((session) => {
        const parsedChat = parseChatAndReportError({
          id: session.id,
          userId: session.userId,
          sessionOutput: session.output,
        });

        if (!parsedChat) {
          return null;
        }

        return {
          id: session.id,
          title: parsedChat.title,
          isShared: parsedChat.isShared,
        };
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

      await ctx.prisma.appSession.deleteMany({
        where: {
          id,
          appId: "lesson-planner",
          userId,
        },
      });
    }),
  deleteAllChats: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.auth;

    await ctx.prisma.appSession.deleteMany({
      where: {
        userId,
        appId: "lesson-planner",
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
        userId: session.userId,
        sessionOutput: session.output,
      });

      const sharedChat = {
        ...chat,
        isShared: true,
      };

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
