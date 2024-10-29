import { prisma } from "@oakai/db";

import { inngest } from "../../inngest";
import { QuizQuestions } from "../../models";

export const embedAllQuizQuestions = inngest.createFunction(
  {
    name: "Generate embeddings for all quiz questions that do not have them",
    id: "app-quiz-question-embed-all",
  },
  { event: "app/quizQuestion.embedAll" },
  async ({ step }) => {
    await step.run("Schedule embedding all quiz questions", async () => {
      const result = await new QuizQuestions(prisma).embedAll();
      return {
        result,
      };
    });
  },
);
