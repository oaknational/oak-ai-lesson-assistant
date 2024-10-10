import { PrismaClientWithAccelerate } from "@oakai/db";

import { createIngestRecord } from "../db-helpers/createIngestRecord";
import { importLessons } from "../import-lessons/importLessons";

/**
 * This function starts an ingest process.
 * It creates a new ingest record in the database, and imports lessons from the Oak API.
 * @todo add configuration for which lessons to import including retrying failed lessons from a previous ingest.
 */
export async function ingestStart({
  prisma,
}: {
  prisma: PrismaClientWithAccelerate;
}) {
  const { id: ingestId } = await createIngestRecord({
    prisma,
    config: {
      completionModel: "gpt-4o-2024-08-06",
      embeddingDimensions: 256,
      embeddingModel: "text-embedding-3-large",
      sourcePartsToInclude: "all",
    },
  });

  await importLessons({ ingestId, onError: console.error });
}
