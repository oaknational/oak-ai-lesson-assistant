import type { PrismaClientWithAccelerate } from "@oakai/db";

import { inngest } from "../client";
import { embedWithCache } from "../utils/embeddings";

export class QuizAnswers {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {}

  async embed(id: string): Promise<number> {
    const quizAnswer = await this.prisma.quizAnswer.findUnique({
      where: { id },
    });
    if (!quizAnswer) {
      throw new Error("Quiz answer not found");
    }

    const embeddings = await embedWithCache(quizAnswer.answer);
    if (!embeddings || embeddings.length === 0) {
      throw new Error("Unable to embed snippet");
    }
    const vector = `[${embeddings.join(",")}]`;
    const result = await this.prisma.$executeRaw`
      UPDATE answers
      SET embedding = ${vector}::vector
      WHERE id = ${id}`;
    return result;
  }

  async embedAll(): Promise<void> {
    const quizAnswers = await this.prisma.quizAnswer.findMany({
      where: {
        status: "PENDING",
      },
    });
    for (const quizAnswer of quizAnswers) {
      await inngest.send({
        name: "app/quizAnswer.embed",
        data: { quizAnswerId: quizAnswer.id },
      });
    }
  }
}
