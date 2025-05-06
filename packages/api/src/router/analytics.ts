import { getHubspotContactByEmail } from "@oakai/core/src/analytics/hubspotClient";

import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

export const analyticsRouter = router({
  getHubspotContact: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { userId } = ctx.auth;
      const user = await clerkClient.users.getUser(userId);

      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User email not found",
        });
      }

      const contact = await getHubspotContactByEmail(email);
      return { contact };
    } catch (error) {
      console.error("Error fetching HubSpot contact:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch HubSpot contact",
      });
    }
  }),
});
