import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import type OpenAI from "openai";

const log = aiLogger("rag");
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

    const queryEmbedding = `[${embedding.data[0]?.embedding.join(",")}]`;
    const limit = 50;

    const startAt = new Date();
    log.info(`Fetching relevant lesson plans for ${title}`);
    let results: { rag_lesson_plan_id: string }[] = [];
    results = await this.prisma.$queryRaw`
        SELECT rag_lesson_plan_id, key, value_text, embedding <-> ${queryEmbedding}::vector
        FROM rag.rag_lesson_plan_parts
        ORDER BY embedding <-> ${queryEmbedding}::vector
        LIMIT ${limit};
    `;

    const endAt = new Date();
    log.info(
      `Fetched ${results.length} lesson plans in ${endAt.getTime() - startAt.getTime()}ms`,
    );

    log.info(JSON.stringify(results, null, 2));
    const all = await this.prisma.ragLessonPlan.findMany({
      where: {
        id: {
          in: results.map((r) => r.rag_lesson_plan_id),
        },
      },
      select: {
        oakLessonSlug: true,
      },
    });
    log.info(all);

    return [];
  }
}
