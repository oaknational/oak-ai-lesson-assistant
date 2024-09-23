import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

export const chatFeedbackRouter = router({
  modifySection: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        messageId: z.string(),
        /**
         * sectionPath is a string that represents the path to the section in the lesson content.
         * E.g. "learningOutcome" or "cycle2.title"
         */
        sectionPath: z.string(),
        sectionValue: z.union([
          z.string(),
          z.array(z.any()),
          z.object({}).passthrough(),
        ]),
        actionOtherText: z.string().nullable(),
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
      const {
        chatId,
        messageId,
        sectionPath,
        sectionValue,
        actionOtherText,
        action,
      } = input;

      try {
        const response = await ctx.prisma.ailaUserModification.create({
          data: {
            userId,
            chatId,
            messageId,
            sectionPath,
            sectionValue,
            action,
            actionOtherText,
          },
        });
        return response;
      } catch (cause) {
        const err = new Error("Failed to create user modification");
        err.cause = cause;
        Sentry.captureException(err, {
          extra: input,
        });
        return err;
      }
    }),
  flagSection: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        messageId: z.string(),
        /**
         * sectionPath is a string that represents the path to the section in the lesson content.
         * E.g. "learningOutcome" or "cycle2.title"
         */
        sectionPath: z.string(),
        sectionValue: z.union([
          z.string(),
          z.array(z.any()),
          z.object({}).passthrough(),
        ]),
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
      const { userId } = ctx.auth;
      const {
        chatId,
        messageId,
        flagType,
        userComment,
        sectionPath,
        sectionValue,
      } = input;
      try {
        const response = await ctx.prisma.ailaUserFlag.create({
          data: {
            userId,
            chatId,
            messageId,
            flagType,
            userComment,
            sectionPath,
            sectionValue,
          },
        });

        return response;
      } catch (cause) {
        const err = new Error("Failed to flag section");
        err.cause = cause;
        Sentry.captureException(err, {
          extra: { chatId, messageId, flagType },
        });
        return err;
      }
    }),
});
