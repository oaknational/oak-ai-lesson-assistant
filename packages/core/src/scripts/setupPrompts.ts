import { prisma } from "@oakai/db";

import { PromptVariants } from "../models/promptVariants";
import { lessonPlannerPrompts, quizGeneratorPrompts } from "../prompts";
import { ailaGenerate } from "../prompts/lesson-assistant/variants";

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

    console.log("Setting up prompts");
    console.log("Aila");
    for (const variant of ailaGenerate.variants) {
      console.log("variant", variant.slug);
      const prompts = new PromptVariants(prisma, ailaGenerate, variant.slug);
      await prompts.setCurrent(variant.slug, true);
    }
    console.log("Lesson Planner");
    for (const k of Object.keys(lessonPlannerPrompts)) {
      const prompt =
        lessonPlannerPrompts[k as keyof typeof lessonPlannerPrompts];
      const prompts = new PromptVariants(prisma, prompt, "main");
      await prompts.setCurrent("main");
    }
    console.log("Quiz Generator");
    for (const k of Object.keys(quizGeneratorPrompts)) {
      const prompt =
        quizGeneratorPrompts[k as keyof typeof quizGeneratorPrompts];
      const prompts = new PromptVariants(prisma, prompt, "main");
      await prompts.setCurrent("main");
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
