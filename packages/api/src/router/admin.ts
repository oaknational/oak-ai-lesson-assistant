import { Moderations, SafetyViolations } from "@oakai/core";
import type { Moderation, SafetyViolation } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import { z } from "zod";

import { getSessionModerations } from "../../../aila/src/features/moderation/getSessionModerations";
import type { AilaPersistedChat } from "../../../aila/src/protocol/schema";
import { chatSchema } from "../../../aila/src/protocol/schema";
import { adminProcedure } from "../middleware/adminAuth";
import { router } from "../trpc";

const log = aiLogger("admin");

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

      const output = chatRecord.output;
      if (typeof output !== "object") {
        throw new Error("sessionOutput is not an object");
      }
      const parseResult = chatSchema.safeParse({
        ...output,
        userId: chatRecord.userId,
        id,
      });

      if (!parseResult.success) {
        return null;
      }

      return parseResult.data;
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
});
