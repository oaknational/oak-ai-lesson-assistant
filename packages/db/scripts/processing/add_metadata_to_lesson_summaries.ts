import { prisma } from "../../index";

const main = async () => {
  try {
    let done = false;
    let skip = 0;
    while (!done) {
      const lessons = await prisma.lesson.findMany({
        take: 10,
        skip,
        include: {
          subject: true,
          keyStage: true,
        },
      });

      if (!lessons || lessons.length === 0) {
        done = true;
      }
      for (const lesson of lessons) {
        await prisma.lessonSummary.updateMany({
          data: {
            subjectId: lesson.subject?.id,
            subjectSlug: lesson.subject?.slug,
            keyStageId: lesson.keyStage?.id,
            keyStageSlug: lesson.keyStage?.slug,
          },
          where: {
            lessonId: lesson.id,
          },
        });
      }
      skip = skip + 10;
    }
  } catch (e) {
    console.error(e);
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
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

export {};
