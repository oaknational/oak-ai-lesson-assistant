import { demoUsers } from "@oakai/core";
import { createHubspotCustomer } from "@oakai/core/src/analytics/hubspotClient";
import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";

import { clerkClient } from "@clerk/nextjs/server";
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

        const email = updatedUser.emailAddresses[0]?.emailAddress;
        if (!email) {
          throw new Error("Email address is expected on clerk user");
        }

        const hubspotContact = await createHubspotCustomer({
          email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          marketingAccepted: Boolean(
            updatedUser.privateMetadata.acceptedPrivacyPolicy,
          ),
        });

        if (hubspotContact.id) {
          posthogAiBetaServerClient.identify({
            distinctId: email,
            properties: {
              hubspot_contact_id: hubspotContact.id,
            },
          });
          await posthogAiBetaServerClient.flush();
        }

        const { acceptedPrivacyPolicy, acceptedTermsOfUse } =
          updatedUser.privateMetadata;

        return { acceptedPrivacyPolicy, acceptedTermsOfUse };
      }
    }),

  setDemoStatus: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.auth;
    const user = await clerkClient.users.getUser(userId);

    if (demoUsers.isDemoStatusSet(user)) {
      return { isDemoUser: user.publicMetadata.labs };
    }

    const { region, isDemoRegion: isDemoUser } = await demoUsers.getUserRegion(
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

    posthogAiBetaServerClient.identify({
      distinctId: userId,
      properties: {
        isDemoUser,
      },
    });

    return { isDemoUser };
  }),
});
