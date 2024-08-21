import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

export const newFeatureFlag = router({
  userCanViewNewFeature: protectedProcedure
    .input(
      z.object({
        email: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { email } = input;
      if (typeof email !== "string") {
        return false;
      }
      let userCanViewNewFeature = false;

      const usersAllowedToView =
        await ctx.prisma.usersAllowedToViewNewFeatures.findMany();

      for (const user of usersAllowedToView) {
        const hasWildcard = user.emailAddress.includes("*@");
        const domain = user.emailAddress.split("@")?.[1] ?? "";
        if (
          user.emailAddress === email ||
          (hasWildcard && email.endsWith(domain))
        ) {
          userCanViewNewFeature = true;
          break;
        }
      }

      return userCanViewNewFeature;
    }),
});
