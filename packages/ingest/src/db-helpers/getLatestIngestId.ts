import { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";

export async function getLatestIngestId({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const ingest = await prisma.ingest.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });
  if (!ingest) {
    throw new IngestError("No ingest found");
  }
  return ingest.id;
}
