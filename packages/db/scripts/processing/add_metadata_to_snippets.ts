import { aiLogger } from "@oakai/logger";

import { prisma } from "../../";

const log = aiLogger("db");

const processBatch = async (skip: number) => {
  const lessons = await prisma.lesson.findMany({
    take: 10,
    skip,
    include: { subject: true, keyStage: true },
  });

  for (const lesson of lessons) {
    await prisma.snippet.updateMany({
      data: {
        subjectId: lesson.subject?.id,
        subjectSlug: lesson.subject?.slug,
        keyStageId: lesson.keyStage?.id,
        keyStageSlug: lesson.keyStage?.slug,
      },
      where: { lessonId: lesson.id },
    });
  }

  return lessons.length === 10;
};

const main = async () => {
  try {
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      hasMore = await processBatch(skip);
      skip += 10;
    }
  } catch (e) {
    log.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    log.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

export {};
