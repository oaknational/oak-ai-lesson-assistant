/**
 * Fetches the categorised key stage and subject from the RAG API.
 * @param input The input to categorise.
 * @returns The categorised key stage and subject.
 * @throws {Error} If the categorisation fails.
 * @example
 * const input = "This is a lesson plan about algebra for KS3 students.";
 * const categorised = await fetchCategorisedInput(input);
 * console.log(categorised);
 * // Output: { keyStage: "KS3", subject: "Maths", title: "Algebra" }
 */
import { RAG } from "@oakai/core/src/rag";
import { PrismaClientWithAccelerate } from "@oakai/db";

import { LooseLessonPlan } from "../../protocol/schema";

export async function fetchCategorisedInput({
  input,
  prisma,
  chatMeta,
}: {
  input: string;
  prisma: PrismaClientWithAccelerate;
  chatMeta: {
    userId: string | undefined;
    chatId: string;
  };
}): Promise<LooseLessonPlan | undefined> {
  const rag = new RAG(prisma);
  const parsedCategorisation = await rag.categoriseKeyStageAndSubject(
    input,
    chatMeta,
  );
  const { keyStage, subject, title, topic } = parsedCategorisation;
  const plan: LooseLessonPlan = {
    keyStage: keyStage ?? undefined,
    subject: subject ?? undefined,
    title: title ?? undefined,
    topic: topic ?? undefined,
  };
  return plan;
}
