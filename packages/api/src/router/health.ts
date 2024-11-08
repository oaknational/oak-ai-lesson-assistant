import { aiLogger } from "@oakai/logger";

import { router, publicProcedure } from "../trpc";

const log = aiLogger("prisma-health-check");

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
