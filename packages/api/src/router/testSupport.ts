import { clerkClient } from "@clerk/nextjs/server";
import os from "os";
import { z } from "zod";

import { testSupportMiddleware } from "../middleware/testSupport";
import { router } from "../trpc";

const branch = process.env.VERCEL_GIT_COMMIT_SHA ?? os.hostname();

// TODO: set demo user status
// TODO: set/clear KV ratelimits
// TODO: set/clear violations
// TODO: unban users

const variants = {
  typical: {
    isDemoUser: false,
    region: "GB",
  },
  demo: {
    isDemoUser: true,
    region: "US",
  },
} as const;

// Used a fixed password for all users for now
const password = "TEST_USER_PASSWORD123";

export const testSupportRouter = router({
  prepareUser: testSupportMiddleware
    .input(
      z.object({
        variant: z.enum(["typical", "demo"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const email = `test-${branch}-${input.variant}@thenational.academy`;
      const variant = variants[input.variant];

      const userId = (
        await clerkClient.users.getUserList({
          emailAddress: [email],
        })
      ).data[0]?.id;

      if (userId) {
        console.log("Test user already exists", { email, variant });
        // TODO: Clear existing user data
        return {
          email,
          password,
        };
      }

      // Create new user
      console.log("Creating test user", { email, variant });
      await clerkClient.users.createUser({
        emailAddress: [email],
        firstName: "Test User",
        lastName: `${branch}/${input.variant}`,

        // TODO: we don't need a password if we use sign in tokens
        password,

        publicMetadata: {
          labs: {
            isOnboarded: true,
            isDemoUser: variant.isDemoUser,
          },
        },
        privateMetadata: {
          acceptedPrivacyPolicy: new Date(),
          acceptedTermsOfUse: new Date(),
          region: variant.region,
        },
      });

      return {
        email,
        password,
      };
    }),
});
