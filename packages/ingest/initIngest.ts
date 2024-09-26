import { prisma } from "@oakai/db";

/**
 * Initialize the ingest package.
 */
async function initIngest() {
  // create a record in the 'ingests' table, status = 'ready_to_start'
  await prisma.ingest.create({
    data: {
      status: "active",
    },
  });
}
