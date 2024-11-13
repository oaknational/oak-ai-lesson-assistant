import { aiLogger } from "@oakai/logger";
import { TRPCError } from "@trpc/server";

import { router, publicProcedure } from "../trpc";

const log = aiLogger("db");

export const healthRouter = router({
  check: publicProcedure.query(() => {
    return "OK";
  }),
  prismaCheck: publicProcedure.query(async ({ ctx }) => {
    try {
      await ctx.prisma.prompt.count();
      return { status: "ok", message: "Prisma is connected" };
    } catch (error) {
      log.error("Prisma health check failed", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Prisma connection failed",
      });
    }
  }),
});
