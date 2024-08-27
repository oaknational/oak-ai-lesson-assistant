import { prisma } from "@oakai/db";

import { inngest } from "../../client";
import { QuizAnswers } from "../../models";

export const embedAllQuizAnswers = inngest.createFunction(
  {
    id: "app-quiz-answer-embed-all",
    name: "Generate embeddings for all quiz answers that do not have them",
  },
  { event: "app/quizAnswer.embedAll" },
  async ({ step }) => {
    await step.run("Schedule embedding all quiz answers", async () => {
      const result = await new QuizAnswers(prisma).embedAll();
      return {
        result,
      };
    });
  },
);
