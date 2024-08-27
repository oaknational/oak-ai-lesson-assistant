import { prisma } from "../../";

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
  const data = await res.json();

  return data.map((user: any) => {
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

  let i = 0;

  while (true) {
    i++;

    const data = await getUsersBatch({
      limit,
      offset,
    });

    if (data.length === 0) {
      break;
    }

    console.log(`Processing batch of ${data.length} users`);

    await prisma.user.createMany({
      data,
    });

    resultsCount += data.length;
    offset += limit;
  }

  console.log(`Created/updated ${resultsCount} user records`);
}

const main = async () => {
  try {
    await prisma.user.deleteMany();
    await updateAllUsers();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    console.log("Done");
    await prisma.$disconnect();
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

export {};
