import { prisma } from "@oakai/db";

//import seedLessons from "@oakai/db/prisma/seed/lessons";

const main = async () => {
  try {
    //await seedLessons();
    console.log("Stubbed");
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
