import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { IngestError } from "../IngestError";
import { getDataHash } from "../utils/getDataHash";
import type { RawLesson } from "../zod-schema/zodSchema";
import { RawLessonSchema } from "../zod-schema/zodSchema";
import { graphqlClient } from "./graphql/client";
import { query } from "./graphql/query";

const log = aiLogger("ingest");

type ImportRawLessonsProps = {
  ingestId: string;
  onError: (error: IngestError) => void;
};
/**
 * This function imports lessons from the Oak API into the AI database.
 */
export async function importLessons({
  ingestId,
  onError,
}: ImportRawLessonsProps) {
  let pageNumber = 0; // Start at page 0
  const limit = 10; // Number of lessons per page
  const offset = pageNumber * limit; // Calculate offset based on the current page

  const variables = {
    limit,
    offset,
  };

  while (true) {
    const lessonData = await graphqlClient.request<{ lessons: unknown[] }>(
      query,
      variables,
    );

    const parsedLessons: RawLesson[] = [];

    for (const lesson of lessonData.lessons) {
      try {
        const parsedLesson = RawLessonSchema.parse(lesson);
        parsedLessons.push(parsedLesson);
      } catch (cause) {
        onError(new IngestError("Failed to parse lesson", { cause }));
      }
    }

    const data = parsedLessons.map((lesson) => {
      return {
        ingestId,
        oakLessonId: lesson.oakLessonId,
        data: lesson,
        dataHash: getDataHash(lesson),
        step: "import",
        stepStatus: "completed",
      };
    });

    log.info(`Importing ${data.length} lessons`);

    await prisma.ingestLesson.createMany({
      data,
    });

    log.info(`Imported ${data.length} lessons`);

    if (lessonData.lessons.length < limit) {
      break;
    }

    pageNumber += 1;
  }
}
