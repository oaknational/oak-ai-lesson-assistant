import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";

import { restrictedLessonIds } from "./restrictedLessonIds";
import type { LessonContentSchema } from "./schemas";
import type { TRPCWorksResponse } from "./types";

const log = aiLogger("additional-materials");

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

export function checkForRestrictedLessonId(lessonId: string) {
  if (restrictedLessonIds.includes(lessonId)) {
    log.error("Restricted lesson detected", { lessonId });
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "restricted-third-party-content: This lesson is restricted and cannot be exported.",
    });
  }
}
