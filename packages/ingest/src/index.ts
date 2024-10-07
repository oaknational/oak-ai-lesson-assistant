/**
 * To be run from CLI with a single argument takes one of:
 * "start", "captions", "lp-start", "lp-sync", "chunk", "embed-start", "embed-sync"
 */
import { prisma } from "@oakai/db";

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

switch (command) {
  case "start":
    ingestStart({ prisma });
    break;
  case "captions":
    captions({ prisma });
    break;
  case "lp-start":
    lpBatchStart({ prisma });
    break;
  case "lp-sync":
    lpBatchSync({ prisma });
    break;
  case "chunk":
    lpChunking({ prisma });
    break;
  case "embed-start":
    lpPartsEmbedStart({ prisma });
    break;
  case "embed-sync":
    lpPartsEmbedSync({ prisma });
    break;
  default:
    console.error("Unknown command");
    process.exit(1);
}
