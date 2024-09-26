import { clerkClient } from "@clerk/nextjs/server";
import os from "os";
import { z } from "zod";

import { publicProcedure } from "../../trpc";
import { seedChat } from "./seedChat";

const branch = process.env.VERCEL_GIT_COMMIT_REF ?? os.hostname();

const personas = {
  // A user with no issues and a completed lesson plan
  typical: {
    isDemoUser: false,
    region: "GB",
    chatFixture: "typical",
  },
  // A user from a demo region
  demo: {
    isDemoUser: true,
    region: "US",
    seedChat: false,
    chatFixture: null,
  },
} as const;

const calculateEmailAddress = (personaName: keyof typeof personas) => {
  const sanitisedBranchName = branch.replace(/[^a-zA-Z0-9]/g, "-");
  return `test+${sanitisedBranchName}-${personaName}@thenational.academy`;
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
  personaName: keyof typeof personas,
) => {
  const persona = personas[personaName];

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
    lastName: personaName,

    publicMetadata: {
      labs: {
        isOnboarded: true,
        isDemoUser: persona.isDemoUser,
      },
    },
    privateMetadata: {
      acceptedPrivacyPolicy: new Date(),
      acceptedTermsOfUse: new Date(),
      region: persona.region,
    },
  });

  return newUser;
};

export const prepareUser = publicProcedure
  .input(
    z.object({
      persona: z.enum(["typical", "demo"]),
    }),
  )
  .mutation(async ({ input }) => {
    const email = calculateEmailAddress(input.persona);
    const user = await findOrCreateUser(email, input.persona);

    const chatFixture = personas[input.persona].chatFixture;
    let chatId: string | undefined;
    if (chatFixture) {
      chatId = await seedChat(user.id, chatFixture);
    }

    return {
      email,
      signInToken: await getSignInToken(user.id),
      chatId: chatId,
    };
  });
