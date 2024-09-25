import { prisma } from "@oakai/db";

import { typicalChat } from "./typical";

export const seedChat = async (userId: string) => {
  const id = `e2e-typical-user${userId}`;
  await prisma.appSession.upsert({
    where: {
      id,
    },
    create: {
      id,
      appId: "lesson-planner",
      userId: userId,
      output: typicalChat,
    },
    update: {
      output: typicalChat,
    },
  });
};
