import type { PrismaClientWithAccelerate } from "@oakai/db";

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
}
