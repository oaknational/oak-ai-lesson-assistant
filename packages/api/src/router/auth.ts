import { clerkClient } from "@clerk/nextjs/server";
import { demoUsers } from "@oakai/core";
import { posthogServerClient } from "@oakai/core/src/analytics/posthogServerClient";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

export const authRouter = router({
  hasSeenWhatsNew: protectedProcedure
    .input(z.object({ userHasSeenThisVersion: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;

      const user = await clerkClient.users.getUser(userId);
      const hasSeenWhatsNew = user.privateMetadata.hasSeenWhatsNew as
        | undefined
        | string[];

      const newArray = hasSeenWhatsNew
        ? [...(hasSeenWhatsNew as []), input.userHasSeenThisVersion]
        : [input.userHasSeenThisVersion];
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          hasSeenWhatsNew: [...newArray],
        },
      });
      return true;
    }),
  userHasSeenLatestWhatsNewVersion: protectedProcedure.query(
    async ({ ctx }) => {
      const { userId } = ctx.auth;

      const user = await clerkClient.users.getUser(userId);
      const { hasSeenWhatsNew } = user.privateMetadata;

      return { hasSeenWhatsNew };
    },
  ),
  acceptTerms: protectedProcedure
    .input(
      z.object({
        termsOfUse: z.date().or(z.literal(false)),
        privacyPolicy: z.date().or(z.literal(false)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.auth;
      if (typeof userId === "string") {
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            labs: {
              isOnboarded: !!input.termsOfUse,
            },
          },
          privateMetadata: {
            acceptedPrivacyPolicy: input.privacyPolicy,
            acceptedTermsOfUse: input.termsOfUse,
          },
        });

        const updatedUser = await clerkClient.users.getUser(userId);

        const { acceptedPrivacyPolicy, acceptedTermsOfUse } =
          updatedUser.privateMetadata;

        return { acceptedPrivacyPolicy, acceptedTermsOfUse };
      }
    }),

  setDemoStatus: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.auth;
    if (typeof userId === "string") {
      const user = await clerkClient.users.getUser(userId);

      if (demoUsers.isDemoStatusSet(user)) {
        return { isDemoUser: user.publicMetadata.labs };
      }

      const { region, isDemoRegion: isDemoUser } =
        await demoUsers.getUserRegion(
          user,
          ctx.req.headers.get("cf-ipcountry"),
        );

      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          labs: {
            isDemoUser,
          },
        },
        privateMetadata: {
          region,
        },
      });

      await posthogServerClient.identify({
        distinctId: userId,
        properties: {
          isDemoUser,
        },
      });

      return { isDemoUser };
    }
  }),
});
