import { aiLogger } from "@oakai/logger";

import type {
  LessonBrowseDataByKsSchema,
  LessonContentSchema,
} from "./lessonOverview.schema";

const log = aiLogger("additional-materials");

export function checkForRestrictedContentGuidance(
  content: LessonContentSchema["content_guidance"],
) {
  if (content === null) {
    return null;
  }
  const contentGuidanceLabels = content.map((item) => ({
    contentGuidanceLabel: item.contentguidance_label ?? "",
    // contentGuidanceDescription: item.contentguidanceDescription ?? "",
    // contentGuidanceArea: item.contentguidanceArea ?? "",
  }));
  console.log("Content Guidance Labels:", contentGuidanceLabels);
  if (
    contentGuidanceLabels.some(
      (item) =>
        item.contentGuidanceLabel ===
          "Depiction or discussion of discriminatory behaviour" ||
        item.contentGuidanceLabel ===
          "Depiction or discussion of sensitive content",
    )
  ) {
    log.error("Restricted content guidance detected", {
      contentGuidanceLabels,
    });
    return Response.json(
      {
        error:
          "This lesson contains restricted content-guidance themes and cannot be exported.",
        contentGuidanceLabels,
      },
      { status: 403 },
    );
  }
}

/**
 * Checks for restricted features in browseData array.
 * If any are found, returns a Response.json with an error and details.
 * Otherwise, returns null.
 */
export function checkForRestrictedFeatures(
  browseData: LessonBrowseDataByKsSchema,
): Response | null {
  const features = browseData.features;

  if (
    features &&
    (features["agf__geo_restricted"] === true ||
      features["agf__login_required"] === true ||
      features["agf__restricted_download"] === true ||
      features["agf__has_copyright_restrictions"] === true ||
      browseData.is_legacy === true)
  ) {
    log.error("Restricted features detected in lesson browse data", {
      features,
      lesson_slug: browseData.lesson_slug,
      unit_slug: browseData.unit_slug,
      programme_slug: browseData.programme_slug,
    });
    return Response.json(
      {
        error:
          "This lesson contains copyright-restricted resources and cannot be exported.",
        restrictedFeatures: { ...features, is_legacy: browseData.is_legacy },
        lesson_slug: browseData.lesson_slug,
        unit_slug: browseData.unit_slug,
        programme_slug: browseData.programme_slug,
      },
      { status: 403 },
    );
  }

  return null;
}
