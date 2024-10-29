import { QuizQuestionStatus, prisma } from "@oakai/db";

import { inngest } from "../../inngest";
import { QuizQuestions } from "../../models";

export const generateQuizQuestionEmbeddings = inngest.createFunction(
  {
    name: "Generate embeddings for a quiz question",
    id: "app-quiz-question-embed",
  },
  { event: "app/quizQuestion.embed" },
  async ({ event, step }) => {
    const { quizQuestionId } = event.data;

    await step.run(
      "Get OpenAI embedding for a quiz question and store in database",
      async () => {
        await new QuizQuestions(prisma).embed(quizQuestionId);
        return {
          quizQuestionId,
        };
      },
    );

    await step.run("Update status to SUCCESS", async () => {
      await prisma.quizQuestion.update({
        where: { id: quizQuestionId },
        data: { status: QuizQuestionStatus.SUCCESS, updatedAt: new Date() },
      });
    });
  },
);
