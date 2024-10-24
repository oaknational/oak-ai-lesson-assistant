import { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import { IngestConfigSchema } from "../config/ingestConfig";

export async function getIngestById({
  prisma,
  ingestId,
}: {
  prisma: PrismaClientWithAccelerate;
  ingestId: string;
}) {
  const ingestRecord = await prisma.ingest.findUnique({
    where: {
      id: ingestId,
    },
  });

  if (!ingestRecord) {
    throw new IngestError(`Ingest with id ${ingestId} not found`);
  }

  const config = IngestConfigSchema.safeParse(ingestRecord.config);

  if (!config.success) {
    throw new IngestError(
      `Ingest with id ${ingestId} has unsupported config: ${config.error.message}`,
      {
        errorDetail: {
          config: ingestRecord.config,
          zodError: config.error,
        },
      },
    );
  }

  return {
    ...ingestRecord,
    config: IngestConfigSchema.parse(ingestRecord.config),
  };
}

export type PersistedIngest = Awaited<ReturnType<typeof getIngestById>>;
