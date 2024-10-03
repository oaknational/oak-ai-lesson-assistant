import { PrismaClientWithAccelerate } from "@oakai/db";

import { importLessons } from "../import-lessons/importLessons";

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
