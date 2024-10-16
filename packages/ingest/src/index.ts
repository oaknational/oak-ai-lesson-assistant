/**
 * To be run from CLI with a single argument takes one of:
 * "start", "captions", "lp-start", "lp-sync", "chunk", "embed-start", "embed-sync"
 */
import { prisma } from "@oakai/db";

import { getLatestIngestId } from "./db-helpers/getLatestIngestId";
import { ingestStart } from "./steps/0-start";
import { captions } from "./steps/1-captions";
import { lpBatchStart } from "./steps/2-lp-batch-start";
import { lpBatchSync } from "./steps/3-lp-batch-sync";
import { lpChunking } from "./steps/4-lp-chunking";
import { lpPartsEmbedStart } from "./steps/5-lp-parts-embed-start";
import { lpPartsEmbedSync } from "./steps/6-lp-parts-embed-sync";

const command = process.argv[2];

if (!command) {
  console.error("No command provided");
  process.exit(1);
}

async function main() {
  const ingestId = process.argv[3] || (await getLatestIngestId({ prisma }));
  switch (command) {
    case "start":
      ingestStart({ prisma });
      break;
    case "captions":
      captions({ prisma, ingestId });
      break;
    case "lp-start":
      lpBatchStart({ prisma, ingestId });
      break;
    case "lp-sync":
      lpBatchSync({ prisma, ingestId });
      break;
    case "chunk":
      lpChunking({ prisma, ingestId });
      break;
    case "embed-start":
      lpPartsEmbedStart({ prisma, ingestId });
      break;
    case "embed-sync":
      lpPartsEmbedSync({ prisma, ingestId });
      break;
    default:
      console.error("Unknown command");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error running command", error);
  process.exit(1);
});
