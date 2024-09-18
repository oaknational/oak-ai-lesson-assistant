import { Moderations, SafetyViolations } from "@oakai/core";
import { Moderation } from "@oakai/db";
import { z } from "zod";

import { getSessionModerations } from "../../../aila/src/features/moderation/getSessionModerations";
import {
  AilaPersistedChat,
  chatSchema,
} from "../../../aila/src/protocol/schema";
import { adminProcedure } from "../middleware/adminAuth";
import { router } from "../trpc";

export const adminRouter = router({
  getModerations: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }): Promise<Moderation[]> => {
      const { id } = input;

      const moderations = await getSessionModerations(id, {
        includeInvalidated: true,
      });

      return moderations;
    }),
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
        throw new Error(`sessionOutput is not an object`);
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
      console.log("Invalidating moderation", { moderationId, invalidatedBy });
      const moderations = new Moderations(prisma);
      await moderations.invalidateModeration({
        moderationId,
        invalidatedBy,
      });

      // remove associated safety violation (and potentially unban user)
      console.log("Removing safety violation", { moderationId });
      const safetyViolations = new SafetyViolations(prisma);
      await safetyViolations.removeViolationsByRecordId(moderationId);
    }),
});