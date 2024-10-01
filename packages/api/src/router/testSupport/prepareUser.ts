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

/**
 * @example test+adams-macbook-pro-local+typical+clerk_test@thenational.academy
 */
const generateEmailAddress = (personaName: keyof typeof personas) => {
  const parts = [
    // All users use the "test@thenational.academy" mailbox with a `+` alias
    "test",
    // Replace non-alphanumeric characters with -
    branch.replace(/\W+/g, "-"),
    // A new login for each persona
    personaName,
    // Allows signing in with the email_code strategy
    "clerk_test",
  ];
  return `${parts.join("+")}@thenational.academy`;
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
    const email = generateEmailAddress(input.persona);
    const user = await findOrCreateUser(email, input.persona);

    const chatFixture = personas[input.persona].chatFixture;
    let chatId: string | undefined;
    if (chatFixture) {
      chatId = await seedChat(user.id, chatFixture);
    }

    return { email, chatId };
  });
