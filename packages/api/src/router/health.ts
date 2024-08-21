import { router, publicProcedure } from "../trpc";

export const healthRouter = router({
  check: publicProcedure.query(() => {
    return "OK";
  }),
});
