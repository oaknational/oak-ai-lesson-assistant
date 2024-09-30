import { prisma } from "@oakai/db";

import { RawLessonSchema } from "../zod-schema/zodSchema";
import { graphqlClient } from "./graphql/client";
import { query } from "./graphql/query";

type ImportRawLessonsProps = {
  ingestId: string;
};
/**
 * This function imports lessons from the Oak API into the AI database.
 */
export async function importRawLessons({ ingestId }: ImportRawLessonsProps) {
  const lessonData = await graphqlClient.request<{ lessons: unknown[] }>(query);

  const data = lessonData.lessons.map((lesson) => {
    return RawLessonSchema.parse(lesson);
  });

  await prisma.ingestRawLesson.createMany({
    data: {
      ingestId,
      status: "should_fetch_transcript",
      data,
    },
  });
}
