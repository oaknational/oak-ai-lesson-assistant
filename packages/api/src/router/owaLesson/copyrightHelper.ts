import { aiLogger } from "@oakai/logger";

import { TRPCError } from "@trpc/server";

import type {
  LessonBrowseDataByKsSchema,
  LessonContentSchema,
} from "./schemas";

const log = aiLogger("additional-materials");

const RESTRICTED_CONTENT_GUIDANCE_TYPES = [
  "Depiction or discussion of discriminatory behaviour",
  "Depiction or discussion of sensitive content",
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

// export function checkForRestrictedFeatures(
//   browseData: LessonBrowseDataByKsSchema,
// ): void {
//   const features = browseData.features;

//   if (
//     features &&
//     (features["agf__geo_restricted"] === true ||
//       features["agf__login_required"] === true ||
//       features["agf__restricted_download"] === true ||
//       features["agf__has_copyright_restrictions"] === true ||
//       browseData.is_legacy === true)
//   ) {
//     log.error("Restricted features detected in lesson browse data", {
//       features,
//       lesson_slug: browseData.lesson_slug,
//       unit_slug: browseData.unit_slug,
//       programme_slug: browseData.programme_slug,
//     });
//     throw new TRPCError({
//       code: "FORBIDDEN",
//       message: "copyright: This lesson contains copyright-restricted resources and cannot be exported.",
//     });
//   }
// }
