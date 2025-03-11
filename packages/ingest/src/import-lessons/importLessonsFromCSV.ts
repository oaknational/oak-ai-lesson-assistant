import { prisma } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import csv from "csv-parser";
import fs from "node:fs";

import { IngestError } from "../IngestError";
import { chunkAndPromiseAll } from "../utils/chunkAndPromiseAll";
import { getDataHash } from "../utils/getDataHash";
import type { RawLesson } from "../zod-schema/zodSchema";
import { RawLessonSchema } from "../zod-schema/zodSchema";

const log = aiLogger("ingest");

type ImportLessonsFromCSVProps = {
  ingestId: string;
  filePath: string;
  onError: (error: IngestError) => void;
};
/**
 * This function imports lessons from a CSV file into the AI database.
 */
export function importLessonsFromCSV({
  ingestId,
  filePath,
  onError,
}: ImportLessonsFromCSVProps) {
  return new Promise<void>((resolve, reject) => {
    try {
      const parsedLessons: RawLesson[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          const {
            lesson_slug,
            lesson_title,
            lesson_id,
            key_stage_slug,
            subject_slug,
          } = row;

          if (typeof lesson_id !== "string") {
            throw new Error("lesson_id must be a string");
          }

          const parsedLesson = RawLessonSchema.parse({
            oakLessonId: parseInt(lesson_id),
            lessonSlug: lesson_slug,
            lessonTitle: lesson_title,
            keyStageSlug: key_stage_slug,
            subjectSlug: subject_slug,
          });

          parsedLessons.push(parsedLesson);
        })
        .on("end", () => {
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

          void chunkAndPromiseAll({
            data,
            fn: async (data) => {
              await prisma.ingestLesson.createMany({
                data,
              });
            },
            chunkSize: 30000,
          }).then(() => {
            log.info(`Imported ${parsedLessons.length} lessons from CSV`);
            resolve();
          });
        })
        .on("error", (cause) => {
          onError(
            new IngestError("Failed to import from CSV", { ingestId, cause }),
          );
          reject(cause);
        });
    } catch (cause) {
      const rejection = new IngestError("Failed to import from CSV", {
        ingestId,
        cause,
      });
      onError(rejection);
      reject(rejection);
    }
  });
}
