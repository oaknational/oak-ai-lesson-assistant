import type { PrismaClientWithAccelerate } from "@oakai/db";

import { inngest } from "../inngest";
import { embedWithCache } from "../utils/embeddings";

export class QuizQuestions {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {}

  async embed(id: string): Promise<number> {
    const quizQuestion = await this.prisma.quizQuestion.findUnique({
      where: { id },
    });
    if (!quizQuestion) {
      throw new Error("Quiz question not found");
    }
    const embeddings = await embedWithCache(quizQuestion.question);
    if (!embeddings || embeddings.length === 0) {
      throw new Error("Unable to embed snippet");
    }
    const vector = `[${embeddings.join(",")}]`;
    const result = await this.prisma.$executeRaw`
      UPDATE questions
      SET embedding = ${vector}::vector
      WHERE id = ${id}`;
    return result;
  }

  async embedAll(): Promise<void> {
    const questions = await this.prisma
      .$queryRaw`SELECT id FROM "public"."questions" WHERE status = 'PENDING' ORDER BY LENGTH(question)`;

    // const questions = await this.prisma.quizQuestion.findMany({
    //   where: {
    //     status: "PENDING",
    //   },
    // });
    for (const question of questions as { id: string }[]) {
      await inngest.send({
        name: "app/quizQuestion.embed",
        data: { quizQuestionId: question.id },
      });
    }
  }

  async generateAll(): Promise<void> {
    const lessons = await this.prisma
      .$queryRaw`SELECT id FROM "public"."lessons"`;

    for (const lesson of lessons as { id: string }[]) {
      await inngest.send({
        name: "app/lesson.quiz.embed",
        data: { lessonId: lesson.id },
      });
    }
  }
}
