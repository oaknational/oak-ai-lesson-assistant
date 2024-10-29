import { prisma } from "@oakai/db";

import { inngest } from "../../inngest";
import { QuizQuestions } from "../../models";

export const generateAllQuizQuestions = inngest.createFunction(
  {
    name: "Generate structure for all quizzes",
    id: "app-quiz-question-generate-all",
  },
  { event: "app/quizQuestion.generateAll" },
  async ({ step }) => {
    await step.run("Schedule embedding all quiz questions", async () => {
      const result = await new QuizQuestions(prisma).generateAll();
      return {
        result,
      };
    });
  },
);
