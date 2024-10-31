import type { PrismaClientWithAccelerate } from "@oakai/db";

import type { IngestConfig } from "../config/ingestConfig";

export async function createIngestRecord({
  prisma,
  config,
}: {
  prisma: PrismaClientWithAccelerate;
  config: IngestConfig;
}) {
  const ingest = await prisma.ingest.create({
    data: {
      config,
      status: "active",
    },
  });

  return { ...ingest, config };
}
