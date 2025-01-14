/**
 * These are essentially database snapshot tests that are used to test the RAG retrieval.
 * Any given RAG data is updated infrequently, so if these tests fail, it's likely
 * it's a signal that the RAG logic has changed.
 * In this case, the new functionality should be tested and the snapshots updated.
 */
import { prisma } from "@oakai/db";

// import OpenAI from "openai";
import ragFixtures from "../fixtures.json";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function pgVectorSearch({
  vector,
  limit = 1,
}: {
  vector: number[];
  limit?: number;
}): Promise<unknown> {
  const prismaResult = await prisma.$queryRaw`
      SELECT
        lesson_plan_id,
        lesson_plan_parts.key,
        lesson_plan_parts."content",
        lesson_plans."content"  ->> 'keyStage' as key_stage_slug,
        lesson_plans."content"  ->> 'subject' as subject_slug,
        lesson_plan_parts.embedding <-> ${vector}::vector AS score
      from lesson_plans join lesson_plan_parts on lesson_plan_parts.lesson_plan_id = lesson_plans.id
      ORDER BY lesson_plan_parts.embedding <-> ${vector}::vector
      LIMIT ${limit}`;

  return prismaResult;
}

describe.skip("RAG search", () => {
  // it("should find lessons on 'xxx'", async () => {
  //   const lesson = {
  //     title: "The End of Roman Britain",
  //     subject: "history",
  //     keyStage: "key-stage-3",
  //   };

  //   const embedding = await openai.embeddings.create({
  //     input: lesson.title,
  //     model: "text-embedding-3-large",
  //     dimensions: 256,
  //   });

  //   console.log(JSON.stringify(embedding.data[0]?.embedding));
  //   const embeddingVector = embedding.data[0]?.embedding;
  //   const limit = 5;

  //   const prismaResult = await prisma.$queryRaw`
  //     SELECT
  //       lesson_plan_id,
  //       lesson_plan_parts.key,
  //       lesson_plan_parts."content",
  //       lesson_plans."content"  ->> 'keyStage' as key_stage_slug,
  //       lesson_plans."content"  ->> 'subject' as subject_slug
  //     from lesson_plans join lesson_plan_parts on lesson_plan_parts.lesson_plan_id = lesson_plans.id
  //     ORDER BY lesson_plan_parts.embedding <-> ${embeddingVector}::vector
  //     LIMIT ${limit}`;
  // });
  it("should find lessons on 'inventions of the industrial revolution'", async () => {
    const vector =
      ragFixtures["inventions of the industrial revolution"].embedding;

    const prismaResult = await pgVectorSearch({ vector });

    expect(prismaResult).toMatchObject([
      {
        lesson_plan_id: "cm23dy6hl05bjba3ufdd2scad",
        key: "title",
        content: "Inventions of the Industrial Revolution",
        key_stage_slug: "ks3",
        subject_slug: "history",
        score: 0.0012731864653905422,
      },
    ]);
  });
  it("should find lessons on 'the end of roman britain'", async () => {
    const vector = ragFixtures["the end of roman britain"].embedding;

    const prismaResult = await pgVectorSearch({ vector });

    expect(prismaResult).toMatchObject([
      {
        lesson_plan_id: "cm23dy6d9059bba3uq0axg5o7",
        key: "topic",
        content: "Anglo-Saxons and the end of Roman Britain",
        key_stage_slug: "key-stage-2",
        subject_slug: "history",
        score: 0.6714155933066479,
      },
    ]);
  });
});
