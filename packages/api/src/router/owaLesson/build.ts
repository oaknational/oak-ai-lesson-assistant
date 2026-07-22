import type { z } from "zod";

import type {
  UnitDataSchema,
  lessonBrowseDataByKsSchema,
  lessonContentSchema,
} from "./schemas";
import { transformOwaLessonToLessonPlan } from "./transformer";

type BuildArgs = {
  parsedLesson: z.infer<typeof lessonContentSchema>;
  parsedBrowseData: z.infer<typeof lessonBrowseDataByKsSchema>;
  pathways: string[];
  browseDataUnits: UnitDataSchema;
  hasRestrictedWorks: boolean;
  hasRestrictedTranscript: boolean;
};

export function buildTransformedLesson({
  parsedLesson,
  parsedBrowseData,
  pathways,
  browseDataUnits,
  hasRestrictedWorks,
  hasRestrictedTranscript,
}: BuildArgs) {
  const transformedLesson = transformOwaLessonToLessonPlan(
    parsedLesson,
    parsedBrowseData,
    pathways,
    browseDataUnits,
  );

  return {
    ...transformedLesson,
    transcript: !hasRestrictedTranscript
      ? String(parsedLesson.transcript_sentences)
      : undefined,
    hasRestrictedWorks,
  };
}
