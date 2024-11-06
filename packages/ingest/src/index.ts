/**
 * To be run from CLI with a single argument takes one of:
 * "start", "captions", "lp-start", "lp-sync", "chunk", "embed-start", "embed-sync"
 */
import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { getLatestIngestId } from "./db-helpers/getLatestIngestId";
import { ingestStart } from "./steps/0-start";
import { captions } from "./steps/1-captions";
import { lpBatchStart } from "./steps/2-lp-batch-start";
import { lpBatchSync } from "./steps/3-lp-batch-sync";
import { lpChunking } from "./steps/4-lp-chunking";
import { lpPartsEmbedStart } from "./steps/5-lp-parts-embed-start";
import { lpPartsEmbedSync } from "./steps/6-lp-parts-embed-sync";

const command = process.argv[2];

const log = aiLogger("ingest");

if (!command) {
  log.error("No command provided");
  process.exit(1);
}

async function main() {
  const ingestId = process.argv[3] ?? (await getLatestIngestId({ prisma }));
  switch (command) {
    case "start":
      await ingestStart({ prisma, log });
      break;
    case "captions":
      await captions({ prisma, log, ingestId });
      break;
    case "lp-start":
      await lpBatchStart({ prisma, log, ingestId });
      break;
    case "lp-sync":
      await lpBatchSync({ prisma, log, ingestId });
      break;
    case "chunk":
      await lpChunking({ prisma, log, ingestId });
      break;
    case "embed-start":
      await lpPartsEmbedStart({ prisma, log, ingestId });
      break;
    case "embed-sync":
      await lpPartsEmbedSync({ prisma, log, ingestId });
      break;

    case "publish":
      // publish({ prisma, log });
      break;
    default:
      log.error("Unknown command");
      process.exit(1);
  }
}

main().catch((error) => {
  log.error("Error running command", error);
  process.exit(1);
});
