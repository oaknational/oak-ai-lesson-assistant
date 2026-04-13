import { migrateChatData } from "@oakai/aila/src/protocol/schemas/versioning/migrateChatData";
import {
  Moderations,
  SafetyViolations,
  type ThreatDetectionWithSafetyViolation,
  ThreatDetections,
} from "@oakai/core";
import type { Moderation, SafetyViolation } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import type { AilaPersistedChat } from "../../../aila/src/protocol/schema";
import { adminProcedure } from "../middleware/adminAuth";
import { router } from "../trpc";

const log = aiLogger("admin");

type AdminUserSafetyReview = {
  safetyViolations: SafetyViolation[];
  threatDetections: ThreatDetectionWithSafetyViolation[];
  maxAllowedSafetyViolations: number;
};

const MAX_ALLOWED_SAFETY_VIOLATIONS = parseInt(
  process.env.SAFETY_VIOLATIONS_MAX_ALLOWED ?? "5",
  10,
);

export const adminRouter = router({
  getModerations: adminProcedure.input(z.object({ id: z.string() })).query(
    async ({
      ctx,
      input,
    }): Promise<{
      moderations: Moderation[];
      safetyViolations: SafetyViolation[];
    }> => {
      const { id } = input;

      const moderationService = new Moderations(ctx.prisma);
      const moderations = await moderationService.byAppSessionId(id, {
        includeInvalidated: true,
      });

      // The SafetyViolation table wasn't designed with relationships to other
      // tables like Moderation. Manually fetch by recordId for now
      const safetyViolations = await ctx.prisma.safetyViolation.findMany({
        where: {
          recordId: {
            in: moderations.map((m) => m.id),
          },
        },
      });

      return { moderations, safetyViolations };
    },
  ),
  getChat: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }): Promise<AilaPersistedChat | null> => {
      const { id } = input;
      const { prisma } = ctx;

      const chatRecord = await prisma.appSession.findUnique({
        where: {
          id: id,
        },
      });

      if (!chatRecord) {
        return null;
      }

      const chat = await migrateChatData(
        chatRecord.output,
        async (upgradedData) => {
          await prisma.appSession.update({
            where: { id },
            data: { output: upgradedData },
          });
        },
        {
          id: chatRecord.id,
          userId: chatRecord.userId,
          caller: "appSessions.getChat",
        },
      );

      return chat;
    }),
  invalidateModeration: adminProcedure
    .input(z.object({ moderationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { moderationId } = input;
      const { prisma, auth } = ctx;
      const { userId: invalidatedBy } = auth;

      // invalidate toxic moderation
      log.info("Invalidating moderation", { moderationId, invalidatedBy });
      const moderations = new Moderations(prisma);
      await moderations.invalidateModeration({
        moderationId,
        invalidatedBy,
      });

      // remove associated safety violation (and potentially unban user)
      log.info("Removing safety violation", { moderationId });
      const safetyViolations = new SafetyViolations(prisma);
      await safetyViolations.removeViolationsByRecordId(moderationId);
    }),
  removeSafetyViolation: adminProcedure
    .input(z.object({ recordId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { recordId } = input;
      const { prisma } = ctx;

      // remove safety violation (and potentially unban user)
      log.info("Removing safety violation", { recordId });
      const safetyViolations = new SafetyViolations(prisma);
      await safetyViolations.removeViolationsByRecordId(recordId);
    }),

  removeSafetyViolationById: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { prisma } = ctx;
      const safetyViolations = new SafetyViolations(prisma);
      await safetyViolations.removeViolationById(id);
    }),

  markThreatDetectionFalsePositive: adminProcedure
    .input(z.object({ threatDetectionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const threatDetections = new ThreatDetections(ctx.prisma);
      await threatDetections.markFalsePositive(input.threatDetectionId);
    }),

  getUserSafetyReview: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }): Promise<AdminUserSafetyReview> => {
      const { userId } = input;
      const threatDetections = new ThreatDetections(ctx.prisma);
      const [safetyViolations, userThreatDetections] = await Promise.all([
        ctx.prisma.safetyViolation.findMany({
          where: {
            userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        threatDetections.byUserId(userId),
      ]);

      return {
        maxAllowedSafetyViolations: MAX_ALLOWED_SAFETY_VIOLATIONS,
        threatDetections: userThreatDetections,
        safetyViolations,
      };
    }),
});
