import { PrismaClientWithAccelerate } from "@oakai/db";

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
  const { id: ingestId } = await prisma.ingest.create({
    data: {
      status: "active",
    },
  });

  await importLessons({ ingestId, onError: console.error });
}
