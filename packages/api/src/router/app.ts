import { Apps } from "@oakai/core";
import { serializeApp } from "@oakai/core/src/models/serializers";
import { sendEmailRequestingMoreGenerations } from "@oakai/core/src/utils/sendEmailRequestingMoreGenerations";
import { prisma } from "@oakai/db";
import logger from "@oakai/logger";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    const appModel = new Apps(ctx.prisma);
    const apps = await appModel.getAll();
    return apps.map(serializeApp);
  }),
  byId: publicProcedure.input(z.string()).query(async ({ ctx, input: id }) => {
    const appModel = new Apps(ctx.prisma);
    const app = await appModel.byId(id);

    if (!app) {
      return new TRPCError({ code: "NOT_FOUND" });
    }

    return serializeApp(app);
  }),

  createSession: protectedProcedure
    // .meta({ openapi: { method: "POST", path: "/apps/sessions" } })
    .input(
      z.object({
        appSlug: z.string(),
      }),
    )
    .output(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId } = ctx.auth;

        const app = await ctx.prisma.app.findFirst({
          where: {
            slug: input.appSlug,
          },
          select: { id: true },
          cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
        });
        if (!app) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No app prompt found",
          });
        }

        const { id: appId } = app;
        if (typeof userId !== "string") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No user found",
          });
        }
        const session = await ctx.prisma.appSession.create({
          data: {
            appId,
            userId,
          },
        });
        console.log("session", session);
        return session;
      } catch (error) {
        logger.error("Error creating session", error);
        throw error;
      }
    }),

  updateSessionState: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        output: z.object({}).passthrough(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      const output = input.output;
      if (typeof userId === "string") {
        const session = await ctx.prisma.appSession.update({
          where: { userId: userId, id: input.sessionId },
          data: { output: output },
        });
        return session;
      }
    }),

  takeShareSnapshot: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      try {
        if (typeof userId === "string") {
          const content = await ctx.prisma.appSession.findFirst({
            where: { userId, id: input.sessionId },
            select: { output: true },
          });

          const session = await ctx.prisma.sharedContent.create({
            data: {
              userId,
              content: content?.output ? content.output : {},
              appSessionId: input.sessionId,
            },
          });
          return session.id;
        }
      } catch (error) {
        logger.error("Error taking share snapshot", error);
      }
    }),

  requestMoreGenerations: protectedProcedure
    .input(
      z.object({
        appSlug: z.string(),
        userEmail: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      logger.info("Requesting more generations to Gleap");
      await sendEmailRequestingMoreGenerations(input);
      return true;
    }),

  /**
   * This wants to be heavily cached in prod, my initial thought
   * was we could do it with cache-control headers alone but
   * because of the serverless nature we might want to do it with
   * redis instead
   */
  timings: protectedProcedure
    .input(
      z.object({
        appSlug: z.string(),
        promptSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { appSlug, promptSlug } = input;

        const { appId, id: promptId } = await prisma.prompt.findFirstOrThrow({
          where: {
            slug: promptSlug,
            app: { slug: appSlug },
            current: true,
          },
          select: { id: true, appId: true },
          cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
        });

        const avgGenerationTimeResult = await ctx.prisma.statistics.findMany({
          where: {
            appId,
            promptId,
          },
          select: { name: true, value: true },
          cacheStrategy: { ttl: 60 * 5, swr: 60 * 2 },
        });

        const timingsKeyedByName = Object.fromEntries(
          avgGenerationTimeResult.map((res) => [res.name, res.value]),
        );
        logger.info("timingsKeyedByName", timingsKeyedByName);
        console.log("timingsKeyedByName", timingsKeyedByName);
        return timingsKeyedByName;
      } catch (error) {
        logger.error("Error fetching timings", error);
        throw error;
      }
    }),
});
