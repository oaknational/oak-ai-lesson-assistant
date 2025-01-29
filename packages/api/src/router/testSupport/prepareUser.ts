import { clerkClient } from "@clerk/nextjs/server";
import { aiLogger } from "@oakai/logger";
import { waitUntil } from "@vercel/functions";
import os from "os";
import { z } from "zod";

import { publicProcedure } from "../../trpc";
import { personaNames, personas } from "./personas";
import { deleteOldTestUser } from "./userPreparation/clerkUsers";
import { setClerkMetadata } from "./userPreparation/metadata";
import { setRateLimitTokens } from "./userPreparation/rateLimiting";
import { setSafetyViolations } from "./userPreparation/safetyViolations";
import { seedChat } from "./userPreparation/seedChat";

const log = aiLogger("testing");

const branch = process.env.VERCEL_GIT_COMMIT_REF ?? os.hostname();

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

const findOrCreateUser = async (
  email: string,
  personaName: keyof typeof personas,
) => {
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
    await Promise.all([
      setSafetyViolations(user.id, persona.safetyViolations),
      setRateLimitTokens(user.id, persona.rateLimitTokens),
      setClerkMetadata(user.id, user, {
        isOnboarded: persona.isOnboarded,
        isDemoUser: persona.isDemoUser,
        region: persona.region,
      }),
    ]);

    return { email, chatId };
  });
