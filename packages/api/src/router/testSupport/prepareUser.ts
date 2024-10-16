import { clerkClient } from "@clerk/nextjs/server";
import { aiLogger } from "@oakai/logger";
import os from "os";
import { z } from "zod";

import { publicProcedure } from "../../trpc";
import { setSafetyViolations } from "./safetyViolations";
import { seedChat } from "./seedChat";

const log = aiLogger("testing");

const branch = process.env.VERCEL_GIT_COMMIT_REF ?? os.hostname();

const personaNames = [
  "typical",
  "demo",
  "nearly-banned",
  "sharing-chat",
] as const;

type PersonaName = (typeof personaNames)[number];
type Persona = {
  isDemoUser: boolean;
  region: "GB" | "US";
  chatFixture: "typical" | null;
  safetyViolations: number;
};

const personas: Record<PersonaName, Persona> = {
  // A user with no issues and a completed lesson plan
  typical: {
    isDemoUser: false,
    region: "GB",
    chatFixture: "typical",
    safetyViolations: 0,
  },
  // A user from a demo region
  demo: {
    isDemoUser: true,
    region: "US",
    chatFixture: null,
    safetyViolations: 0,
  },
  // A user with 3 safety violations - will be banned with one more
  "nearly-banned": {
    isDemoUser: false,
    region: "GB",
    chatFixture: null,
    safetyViolations: 3,
  },
  // Allows `chat.isShared` to be set/reset without leaking between tests/retries
  "sharing-chat": {
    isDemoUser: false,
    region: "GB",
    chatFixture: "typical",
    safetyViolations: 0,
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
    if (existingUser.banned) {
      await clerkClient.users.unbanUser(existingUser.id);
    }
    return existingUser;
  }

  log("Creating test user", { email });
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
      persona: z.enum(personaNames),
    }),
  )
  .mutation(async ({ input }) => {
    const email = generateEmailAddress(input.persona);
    const user = await findOrCreateUser(email, input.persona);

    const persona = personas[input.persona];

    let chatId: string | undefined;
    if (persona.chatFixture) {
      chatId = await seedChat(user.id, persona.chatFixture);
    }
    await setSafetyViolations(user.id, persona.safetyViolations);

    return { email, chatId };
  });
