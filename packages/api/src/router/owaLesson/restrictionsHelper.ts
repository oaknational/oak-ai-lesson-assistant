import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";

import {
  type LessonRestriction,
  getLessonRestrictions,
  isSubjectExcluded,
  shouldExcludeLesson,
} from "./lessonRestrictions";
import {
  type LessonContentSchema,
  lessonRestrictionLevelsSchema,
} from "./schemas";
import type { TRPCWorksResponse } from "./types";

const log = aiLogger("teaching-materials");

const RESTRICTED_CONTENT_GUIDANCE_TYPES = [
  "Depiction or discussion of sexual violence",
  "Depiction or discussion of sexual content",
  "Depiction or discussion of mental health issues",
  "Depiction or discussion of serious crime",
] as const;

export function checkForRestrictedContentGuidance(
  content: LessonContentSchema["content_guidance"],
): void {
  if (content === null) {
    return;
  }

  const contentGuidanceLabels = content.map((item) => ({
    contentGuidanceLabel: item.contentguidance_label ?? "",
  }));

  const hasRestrictedContent = contentGuidanceLabels.some((item) =>
    RESTRICTED_CONTENT_GUIDANCE_TYPES.includes(
      item.contentGuidanceLabel as (typeof RESTRICTED_CONTENT_GUIDANCE_TYPES)[number],
    ),
  );

  if (hasRestrictedContent) {
    log.error("Restricted content guidance detected", {
      contentGuidanceLabels,
    });
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "content-guidance: This lesson contains restricted content-guidance themes and cannot be exported.",
    });
  }
}

export function checkForRestrictedWorks(tcpData: TRPCWorksResponse): boolean {
  const worksList = tcpData.data?.tcpWorksByLessonSlug?.[0]?.works_list ?? [];
  const hasRestrictedWorks = worksList.length > 0;

  if (hasRestrictedWorks) {
    log.error("Restricted tpc", {
      restrictedWorks: JSON.stringify(hasRestrictedWorks),
    });
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "restricted-third-party-content: This lesson contains restricted content and cannot be exported.",
    });
  }

  log.info(
    "Has restricted works:",
    hasRestrictedWorks,
    "Works list:",
    worksList,
  );

  return hasRestrictedWorks;
}

export function checkForRestrictedSubject(subjectSlugs: string[]): void {
  const excludedSubjectSlugs = subjectSlugs.filter((subjectSlug) =>
    isSubjectExcluded(subjectSlug),
  );

  if (subjectSlugs.length === 0 || excludedSubjectSlugs.length > 0) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "restricted-subject",
    });
  }
}

/**
 * Throws if the lesson's restriction levels exclude it, otherwise returns its restrictions.
 * A lesson with no published restriction levels is excluded
 */
export function checkForRestrictionLevels(
  tcpData: TRPCWorksResponse,
): LessonRestriction[] {
  const parsedLevels = lessonRestrictionLevelsSchema.safeParse(
    tcpData.data?.restrictionLevels?.[0],
  );
  if (!parsedLevels.success && tcpData.data?.restrictionLevels?.[0]) {
    log.error("Failed to parse lesson restriction levels", {
      error: parsedLevels.error,
    });
  }

  const restrictions = getLessonRestrictions(
    parsedLevels.success
      ? {
          tpcWorksMaxRestriction: parsedLevels.data.tpc_works_max_restriction,
          tpcMediaMaxRestriction: parsedLevels.data.tpc_media_max_restriction,
          features: parsedLevels.data.features,
        }
      : undefined,
  );

  if (shouldExcludeLesson(restrictions)) {
    log.error("Restricted lesson detected from restriction levels", {
      restrictions,
    });
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "restricted-third-party-content: This lesson contains restricted content and cannot be exported.",
    });
  }

  return restrictions;
}
