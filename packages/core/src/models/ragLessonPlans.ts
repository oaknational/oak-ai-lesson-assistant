import { PrismaClientWithAccelerate } from "@oakai/db";
import OpenAI from "openai";

/**
 *
 */
export class RagLessonPlans {
  constructor(
    private readonly prisma: PrismaClientWithAccelerate,
    private readonly openai: OpenAI,
  ) {}

  async getRelevantLessonPlans({ title }: { title: string }): Promise<{}[]> {
    const embedding = await this.openai.embeddings.create({
      model: "text-embedding-3-large",
      dimensions: 256,
      input: title,
      encoding_format: "float",
    });

    // console.log(JSON.stringify(embedding));

    const queryEmbedding = `[${embedding.data[0]?.embedding.join(",")}]`;
    const limit = 5;
    // console.log(queryEmbedding);

    const results = await this.prisma.$queryRaw`
        SELECT rag_lesson_plan_id
        FROM rag.rag_lesson_plan_parts
        ORDER BY embedding <-> ${queryEmbedding}::vector
        LIMIT ${limit};
    `;

    console.log(results);
    const all = await this.prisma.ragLessonPlan.findMany();
    console.log(all);

    return [];
  }
}
