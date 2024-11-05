import { prisma } from "@oakai/db";

import { inngest } from "../../inngest";
import { Lessons } from "../../models";

export const generateLessonQuizEmbeddings = inngest.createFunction(
  {
    id: "app-lesson-quiz-embed",
    name: "Generate embeddings for all questions and answers in a lesson's quiz",
  },
  { event: "app/lesson.quiz.embed" },
  async ({ event, step }) => {
    const { lessonId } = event.data;

    await step.run("Create quiz structure if it does not exist", async () => {
      await new Lessons(prisma).createQuizStructure(lessonId);
    });

    await step.run(
      "Loop over all questions and answers and generate embeddings",
      async () => {
        const lesson = await prisma.lesson.findUniqueOrThrow({
          where: { id: lessonId },
          include: { questions: { include: { answers: true } } },
        });

        for (const question of lesson.questions) {
          await step.sendEvent("embed-quiz-question", {
            name: "app/quizQuestion.embed",
            data: { quizQuestionId: question.id },
          });
          for (const answer of question.answers) {
            await step.sendEvent("embed-quiz-answer", {
              name: "app/quizAnswer.embed",
              data: { quizAnswerId: answer.id },
            });
          }
        }
      },
    );
  },
);
