import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { PromptVariants } from "../models/promptVariants";
import { lessonPlannerPrompts, quizGeneratorPrompts } from "../prompts";
import { ailaGenerate } from "../prompts/lesson-assistant/variants";

const log = aiLogger("core");

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
    // Ensure the apps exist in the database
    await prisma.$transaction(
      apps.map((app) =>
        prisma.app.upsert({
          where: { id: app.id },
          create: app,
          update: app,
        }),
      ),
    );

    log.info("Setting up prompts");
    log.info("Aila");
    for (const variant of ailaGenerate.variants) {
      log.info("variant", variant.slug);
      const prompts = new PromptVariants(prisma, ailaGenerate, variant.slug);
      await prompts.setCurrent(variant.slug, true);
    }
    log.info("Lesson Planner");
    for (const k of Object.keys(lessonPlannerPrompts)) {
      const prompt =
        lessonPlannerPrompts[k as keyof typeof lessonPlannerPrompts];
      const prompts = new PromptVariants(prisma, prompt, "main");
      await prompts.setCurrent("main");
    }
    log.info("Quiz Generator");
    for (const k of Object.keys(quizGeneratorPrompts)) {
      const prompt =
        quizGeneratorPrompts[k as keyof typeof quizGeneratorPrompts];
      const prompts = new PromptVariants(prisma, prompt, "main");
      await prompts.setCurrent("main");
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
