import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import { prisma } from "../../";

const logger = aiLogger("db");

const ClerkUserSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  email_addresses: z.array(
    z.object({
      id: z.string(),
      email_address: z.string().email(),
    }),
  ),
  primary_email_address_id: z.string(),
});

/**
 * This script deletes all records from the `users` table, then re-imports them all
 * from clerk
 */

async function getUsersBatch({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}) {
  const res = await fetch(
    `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}&order_by=-last_sign_in_at`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    },
  );

  const ClerkResponseSchema = z.array(ClerkUserSchema);

  const validatedData = ClerkResponseSchema.parse(await res.json());

  return validatedData.map((user) => {
    const email: string = user.email_addresses.find(
      (email: { id: string }) => email.id === user.primary_email_address_id,
    )!.email_address;

    const isOakUser =
      email.endsWith("@thenational.academy") || email === "tom@putty.studio";

    return {
      id: user.id,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
      // ONLY store the email if they're an internal user
      emailAddress: isOakUser ? email : null,
      isOakUser: isOakUser,
    };
  });
}

async function updateAllUsers() {
  const limit = 300;
  let offset = 0;
  let resultsCount = 0;

  while (true) {
    const data = await getUsersBatch({
      limit,
      offset,
    });

    if (data.length === 0) {
      break;
    }

    logger.info(`Processing batch of ${data.length} users`);

    await prisma.user.createMany({
      data,
    });

    resultsCount += data.length;
    offset += limit;
  }

  logger.info(`Created/updated ${resultsCount} user records`);
}

const main = async () => {
  try {
    await prisma.user.deleteMany();
    await updateAllUsers();
  } catch (e) {
    logger.error(e);
    process.exit(1);
  } finally {
    logger.info("Done");
    await prisma.$disconnect();
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

export {};
