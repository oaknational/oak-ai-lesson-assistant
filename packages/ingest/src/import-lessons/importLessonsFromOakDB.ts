import { prisma } from "@oakai/db";

import { IngestError } from "../IngestError";
import type { IngestLogger } from "../types";
import { getDataHash } from "../utils/getDataHash";
import type { RawLesson } from "../zod-schema/zodSchema";
import { RawLessonSchema } from "../zod-schema/zodSchema";
import { graphqlClient } from "./graphql/client";
import { type QueryVariables, query } from "./graphql/query";

type ImportLessonsFromOakDBProps = {
  ingestId: string;
  log: IngestLogger;
  onError: (error: IngestError) => void;
};
/**
 * This function imports lessons from the Oak API into the AI database.
 */
export async function importLessonsFromOakDB({
  ingestId,
  log,
  onError,
}: ImportLessonsFromOakDBProps) {
  let pageNumber = 0; // Start at page 0
  const perPage = 100; // Number of lessons per page

  let imported = 0;

  while (true) {
    const offset = pageNumber * perPage; // Calculate offset based on the current page
    const variables = {
      limit: perPage,
      offset,
      where: {
        videoTitle: {
          _is_null: false,
        },
        isLegacy: {
          _is_null: false,
        },
      },
    };
    const lessonData = await graphqlClient.request<
      { lessons: unknown[] },
      QueryVariables
    >(query, variables);

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

    await prisma.ingestLesson.createMany({
      data,
    });

    imported += data.length;
    log.info(`Imported ${imported} lessons`);

    if (lessonData.lessons.length < perPage) {
      break;
    }

    pageNumber += 1;
  }
}
