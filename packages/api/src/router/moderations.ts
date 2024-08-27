import * as Sentry from "@sentry/node";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

export const moderationsRouter = router({
  userComment: protectedProcedure
    .input(
      z.object({
        comment: z.string(),
        moderationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { comment, moderationId } = input;
      const { userId } = ctx.auth;
      Sentry.setContext("userComment", { comment, moderationId, userId });
      try {
        await ctx.prisma.moderation.update({
          where: {
            id: moderationId,
            userId,
          },
          data: {
            userComment: comment,
          },
        });
      } catch (e) {
        Sentry.captureException(e, {
          extra: { comment, moderationId, userId },
        });
        console.error("Error", e);
      }
    }),
  moderationById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      return await ctx.prisma.moderation.findUnique({
        where: {
          id: input,
          userId,
        },
      });
    }),
});
