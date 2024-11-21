import { prisma, QuizAnswerStatus } from "@oakai/db";

import { inngest } from "../../inngest";
import { QuizAnswers } from "../../models";

export const generateQuizAnswerEmbeddings = inngest.createFunction(
  {
    name: "Generate embeddings for a quiz answer",
    id: "app-quiz-answer-embed",
  },
  { event: "app/quizAnswer.embed" },
  async ({ event, step }) => {
    const { quizAnswerId } = event.data;

    await step.run(
      "Get OpenAI embedding for a quiz question and store in database",
      async () => {
        await new QuizAnswers(prisma).embed(quizAnswerId);
        return {
          quizAnswerId,
        };
      },
    );

    await step.run("Update status to SUCCESS", async () => {
      await prisma.quizAnswer.update({
        where: { id: quizAnswerId },
        data: { status: QuizAnswerStatus.SUCCESS, updatedAt: new Date() },
      });
    });
  },
);
