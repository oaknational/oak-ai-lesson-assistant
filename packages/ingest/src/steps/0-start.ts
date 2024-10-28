import type { PrismaClientWithAccelerate } from "@oakai/db";

import { IngestError } from "../IngestError";
import type { IngestConfig } from "../config/ingestConfig";
import { createIngestRecord } from "../db-helpers/createIngestRecord";
import { importLessonsFromCSV } from "../import-lessons/importLessonsFromCSV";
import { importLessonsFromOakDB } from "../import-lessons/importLessonsFromOakDB";
import type { IngestLogger } from "../types";

const config: IngestConfig = {
  completionModel: "gpt-4o-2024-08-06",
  completionTemperature: 0.7,
  embeddingDimensions: 256,
  embeddingModel: "text-embedding-3-large",
  sourcePartsToInclude: "all",
  source: {
    type: "oak-db",
  },
};

/**
 * This function starts an ingest process.
 * It creates a new ingest record in the database, and imports lessons from the Oak API.
 */
export async function ingestStart({
  prisma,
  log,
}: {
  prisma: PrismaClientWithAccelerate;
  log: IngestLogger;
}) {
  const { id: ingestId } = await createIngestRecord({
    prisma,
    config,
  });

  switch (config.source.type) {
    case "oak-db":
      await importLessonsFromOakDB({
        ingestId,
        log,
        onError: log.error,
      });
      break;
    case "csv":
      if (config.sourcePartsToInclude !== "title-subject-key-stage") {
        throw new IngestError(
          "sourcePartsToInclude must be title-subject-key-stage when importing from a CSV file",
        );
      }
      await importLessonsFromCSV({
        ingestId,
        filePath: config.source.filePath,
        onError: log.error,
      });
      break;
    default:
      throw new IngestError("Unsupported source type");
  }

  log.info(`Ingest started with id: ${ingestId}`);
}
