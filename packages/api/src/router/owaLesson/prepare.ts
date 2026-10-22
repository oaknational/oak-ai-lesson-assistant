import { TRPCError } from "@trpc/server";
import type { z } from "zod";

import { shouldExcludeTranscript } from "./lessonRestrictions";
import {
  checkForRestrictedContentGuidance,
  checkForRestrictedSubject,
  checkForRestrictedWorks,
  checkForRestrictionLevels,
} from "./restrictionsHelper";
import { lessonBrowseDataByKsSchema, lessonContentSchema } from "./schemas";
import type { UnitDataSchema } from "./schemas";
import type { LessonOverviewResponse, TRPCWorksResponse } from "./types";

type PrepareArgs = {
  lessonData: LessonOverviewResponse;
  tcpData: TRPCWorksResponse;
  isCanonicalLesson: boolean;
};

type PrepareResult = {
  parsedLesson: z.infer<typeof lessonContentSchema>;
  parsedBrowseData: z.infer<typeof lessonBrowseDataByKsSchema>;
  pathways: string[];
  browseDataUnits: UnitDataSchema;
  hasRestrictedWorks: boolean;
  hasRestrictedTranscript: boolean;
};

export function prepareAndCheckRestrictions({
  lessonData,
  tcpData,
  isCanonicalLesson,
}: PrepareArgs): PrepareResult {
  const rawLesson = lessonData.data!.content![0]!;
  const parsedLesson = lessonContentSchema.parse(rawLesson);

  const browseDataArray = lessonData.data!.browseData!;
  const pathways = isCanonicalLesson
    ? Array.from(
        new Set(
          browseDataArray.map((item) => String(item.programme_fields?.subject)),
        ),
      )
    : [];

  const browseData = browseDataArray.find(
    (item) => item.lesson_slug === parsedLesson.lesson_slug,
  );

  const browseDataUnits = browseDataArray.filter(
    (item) => item.unit_slug === browseData?.unit_slug,
  );

  if (!browseData) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Lesson not found in browse data",
    });
  }

  const parsedBrowseData = lessonBrowseDataByKsSchema.parse(browseData);

  // A lesson can sit in more than one subject, so check all of them whichever link was used
  const subjectSlugs = Array.from(
    new Set(
      (lessonData.data!.subjectMemberships ?? []).flatMap(
        (membership) => membership.subject_slug ?? [],
      ),
    ),
  );

  checkForRestrictedSubject(subjectSlugs);
  checkForRestrictedContentGuidance(parsedLesson.content_guidance);
  const hasRestrictedWorks = checkForRestrictedWorks(tcpData);
  const restrictions = checkForRestrictionLevels(tcpData);
  const hasRestrictedTranscript = shouldExcludeTranscript({
    restrictions,
    subjectSlugs,
  });

  if (parsedLesson.is_legacy) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "This lesson is legacy lesson and cannot be used for a new teaching material.",
    });
  }

  return {
    parsedLesson,
    parsedBrowseData,
    pathways,
    browseDataUnits,
    hasRestrictedWorks,
    hasRestrictedTranscript,
  };
}
