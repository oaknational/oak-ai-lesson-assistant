import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

const log = aiLogger("core");

const main = async () => {
  try {
    log.info("Stubbed");
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
