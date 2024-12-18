import { clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/shared";
import { aiLogger } from "@oakai/logger";
import { waitUntil } from "@vercel/functions";
import os from "os";
import { z } from "zod";

import { publicProcedure } from "../../trpc";
import { setRateLimitTokens } from "./rateLimiting";
import { setSafetyViolations } from "./safetyViolations";
import { seedChat } from "./seedChat";

const log = aiLogger("testing");

const branch = process.env.VERCEL_GIT_COMMIT_REF ?? os.hostname();

const GENERATIONS_PER_24H = parseInt(
  process.env.RATELIMIT_GENERATIONS_PER_24H ?? "120",
  10,
);

const personaNames = [
  "typical",
  "demo",
  "nearly-banned",
  "nearly-rate-limited",
  "sharing-chat",
  "modify-lesson-plan",
] as const;

type PersonaName = (typeof personaNames)[number];
type Persona = {
  isDemoUser: boolean;
  region: "GB" | "US";
  chatFixture: "typical" | null;
  safetyViolations: number;
  rateLimitTokens: number;
};

const personas: Record<PersonaName, Persona> = {
  // A user with no issues and a completed lesson plan
  typical: {
    isDemoUser: false,
    region: "GB",
    chatFixture: "typical",
    safetyViolations: 0,
    rateLimitTokens: 0,
  },
  // A user from a demo region
  demo: {
    isDemoUser: true,
    region: "US",
    chatFixture: null,
    safetyViolations: 0,
    rateLimitTokens: 0,
  },
  // A user with 3 safety violations - will be banned with one more
  "nearly-banned": {
    isDemoUser: false,
    region: "GB",
    chatFixture: null,
    safetyViolations: 3,
    rateLimitTokens: 0,
  },
  // A user with 119 of their 120 generations remaining
  "nearly-rate-limited": {
    isDemoUser: false,
    region: "GB",
    chatFixture: null,
    safetyViolations: 0,
    rateLimitTokens: GENERATIONS_PER_24H - 1,
  },
  // Allows `chat.isShared` to be set/reset without leaking between tests/retries
  "sharing-chat": {
    isDemoUser: false,
    region: "GB",
    chatFixture: "typical",
    safetyViolations: 0,
    rateLimitTokens: 0,
  },
  "modify-lesson-plan": {
    isDemoUser: false,
    region: "GB",
    chatFixture: "typical",
    safetyViolations: 0,
    rateLimitTokens: 0,
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
    branch.replace(/\W+/g, "-").slice(-15),
    // A new login for each persona
    personaName,
    // Allows signing in with the email_code strategy
    "clerk_test",
  ];
  return `${parts.join("+")}@thenational.academy`;
};

const deleteOldTestUser = async () => {
  const result = await clerkClient.users.getUserList({
    limit: 500,
  });

  const NUMBERS_USER = /\d{5,10}.*@/; // jim+010203@thenational.academy
  const testUsers = result.data.filter((u) => {
    const email = u.primaryEmailAddress?.emailAddress ?? "";
    return email.startsWith("test+") || email.match(NUMBERS_USER);
  });

  if (testUsers.length < 100) {
    log.info(`less than 100 test users. Skipping cleanup.`);
    return;
  }

  const users = testUsers.toSorted(
    (a, b) =>
      new Date(a.lastActiveAt ?? a.createdAt).getTime() -
      new Date(b.lastActiveAt ?? b.createdAt).getTime(),
  );

  // If multiple personas are created at the same time and both try to delete the
  // oldest user they will conflict. Add some randomness to reduce conflicts
  const randomOffset = Math.floor(Math.random() * 8);
  const userToDelete = users[randomOffset];

  if (userToDelete) {
    try {
      await clerkClient.users.deleteUser(userToDelete.id);
      log.info(
        "Deleted old test user",
        userToDelete.primaryEmailAddress?.emailAddress,
      );
    } catch (e) {
      if (isClerkAPIResponseError(e) && e.status === 404) {
        log.info(
          `${userToDelete.primaryEmailAddress?.emailAddress} already deleted, retrying`,
        );
        await deleteOldTestUser();
      } else {
        throw e;
      }
    }
  }
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

  log.info("Creating test user", { email });
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

  waitUntil(deleteOldTestUser());

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
    await setRateLimitTokens(user.id, persona.rateLimitTokens);

    return { email, chatId };
  });
