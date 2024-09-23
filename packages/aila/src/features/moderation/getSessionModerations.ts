import { Moderations } from "@oakai/core";
import { Moderation, prisma } from "@oakai/db";

export async function getSessionModerations(
  appSessionId: string,
  opts: { includeInvalidated?: boolean } = {},
): Promise<Moderation[]> {
  const moderations = new Moderations(prisma);
  const moderation = await moderations.byAppSessionId(appSessionId, opts);

  return moderation;
}
