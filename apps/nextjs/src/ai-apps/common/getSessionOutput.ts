import { Apps } from "@oakai/core";
import { prisma } from "@oakai/db";
import { outputSchema } from "ai-apps/generations/types";

export default async function getSessionOutput(
  userId: string | null,
  slug: string | string[] | undefined,
) {
  const appsModel = new Apps(prisma);

  const sessionId = slug;
  if (typeof sessionId !== "string") {
    throw new Error("Session not found");
  }
  if (!userId) {
    return {
      redirect: {
        destination: "/sign-up",
        permanent: false,
      },
    };
  }
  const singleSessionOutput = await appsModel.getSingleSessionOutput(
    sessionId,
    userId,
  );
  const parsedOutput = outputSchema.parse(singleSessionOutput?.output);
  const data = {
    sessionId: singleSessionOutput?.id,
    ...parsedOutput,
  };
  return { data };
}
