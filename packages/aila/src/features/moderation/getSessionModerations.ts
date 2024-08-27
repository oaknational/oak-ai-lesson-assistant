import { Moderations } from "@oakai/core";
import { prisma } from "@oakai/db";

export async function getSessionModerations(appSessionId: string) {
  const moderations = new Moderations(prisma);
  const moderation = await moderations.byAppSessionId(appSessionId);

  return moderation;
}
