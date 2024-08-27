import { prisma } from "@oakai/db";

import { PromptVariants } from "../models/promptVariants";
import { lessonPlannerPrompts, quizGeneratorPrompts } from "../prompts";

const main = async () => {
  try {
    for (const k of Object.keys(lessonPlannerPrompts)) {
      const prompt =
        lessonPlannerPrompts[k as keyof typeof lessonPlannerPrompts];
      const prompts = new PromptVariants(prisma, prompt, "main");
      await prompts.setCurrent();
    }
    for (const k of Object.keys(quizGeneratorPrompts)) {
      const prompt =
        quizGeneratorPrompts[k as keyof typeof quizGeneratorPrompts];
      const prompts = new PromptVariants(prisma, prompt, "main");
      await prompts.setCurrent();
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
