import { prisma } from "@oakai/db";

import typicalChatJson from "./typical.json";

const fixtures = {
  typical: typicalChatJson,
};

export const seedChat = async (
  userId: string,
  fixtureName: keyof typeof fixtures,
) => {
  const id = `e2e-typical-${userId}`;
  const output = fixtures[fixtureName];

  await prisma.appSession.upsert({
    where: {
      id,
    },
    create: {
      id,
      appId: "lesson-planner",
      userId,
      output,
    },
    update: {
      output,
    },
  });
  return id;
};
