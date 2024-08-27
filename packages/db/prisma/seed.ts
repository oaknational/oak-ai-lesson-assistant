import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const apps = [
  {
    name: "Quiz Generator",
    slug: "quiz-generator",
    id: "quiz-generator",
  },
  {
    name: "Lesson planner",
    slug: "lesson-planner",
    id: "lesson-planner",
  },
];

const main = async () => {
  try {
    await prisma.$transaction(
      apps.map((app) =>
        prisma.app.upsert({
          where: { id: app.id },
          create: app,
          update: app,
        }),
      ),
    );

    //await seedLessons();
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
