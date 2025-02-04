import { clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/shared";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("testing");

export const deleteOldTestUser = async () => {
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
