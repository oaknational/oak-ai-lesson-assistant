import { clerkClient } from "@clerk/nextjs/server";
import os from "os";
import { z } from "zod";

import { publicProcedure } from "../../trpc";
import { seedChat } from "./seedChat";

const branch = process.env.VERCEL_GIT_COMMIT_REF ?? os.hostname();

const variants = {
  // A user with no issues and a completed lesson plan
  typical: {
    isDemoUser: false,
    region: "GB",
    seedChat: true,
  },
  // A user from a demo region
  demo: {
    isDemoUser: true,
    region: "US",
    seedChat: false,
  },
} as const;

const calculateEmailAddress = (variantName: keyof typeof variants) => {
  const sanitisedBranchName = branch.replace(/[^a-zA-Z0-9]/g, "-");
  return `test+${sanitisedBranchName}-${variantName}@thenational.academy`;
};

const getSignInToken = async (userId: string) => {
  const response = await clerkClient.signInTokens.createSignInToken({
    userId,
    expiresInSeconds: 60 * 5,
  });

  return response.token;
};

const findOrCreateUser = async (
  email: string,
  variantName: keyof typeof variants,
) => {
  const variant = variants[variantName];

  const existingUser = (
    await clerkClient.users.getUserList({
      emailAddress: [email],
    })
  ).data[0];

  if (existingUser) {
    return existingUser;
  }

  console.log("Creating test user", { email });
  const newUser = await clerkClient.users.createUser({
    emailAddress: [email],
    firstName: branch,
    lastName: variantName,

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

  return newUser;
};

export const prepareUser = publicProcedure
  .input(
    z.object({
      variant: z.enum(["typical", "demo"]),
    }),
  )
  .mutation(async ({ input }) => {
    const email = calculateEmailAddress(input.variant);
    const user = await findOrCreateUser(email, input.variant);

    const shouldSeedChat = variants[input.variant].seedChat;
    if (shouldSeedChat) {
      await seedChat(user.id);
    }

    return {
      email,
      signInToken: await getSignInToken(user.id),
    };
  });
