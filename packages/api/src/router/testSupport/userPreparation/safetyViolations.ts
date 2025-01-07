import { prisma } from "@oakai/db";

const generateViolationData = (userId: string) => {
  return {
    userId,
    userAction: "CHAT_MESSAGE",
    detectionSource: "MODERATION",
    recordType: "CHAT_SESSION",
    recordId: "dummy_chat_1",
  } as const;
};

export const setSafetyViolations = async (userId: string, count: number) => {
  await prisma.safetyViolation.deleteMany({
    where: {
      userId,
    },
  });

  if (count > 0) {
    await prisma.safetyViolation.createMany({
      data: Array.from({ length: count }, () => generateViolationData(userId)),
    });
  }
};
