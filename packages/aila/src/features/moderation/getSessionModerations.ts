import { Moderations } from "@oakai/core/src/models/moderations";
import type { PrismaClientWithAccelerate } from "@oakai/db/client";

import type { Moderation } from "@prisma/client";

export async function getSessionModerations(
  appSessionId: string,
  prisma: PrismaClientWithAccelerate,
  opts: { includeInvalidated?: boolean } = {},
): Promise<Moderation[]> {
  const moderations = new Moderations(prisma);
  const moderation = await moderations.byAppSessionId(appSessionId, opts);

  return moderation;
}
