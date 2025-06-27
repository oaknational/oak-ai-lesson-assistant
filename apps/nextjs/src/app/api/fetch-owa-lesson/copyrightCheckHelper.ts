import type { LessonBrowseDataByKsSchema } from "./lessonOverview.schema";

/**
 * Checks for restricted features in browseData array.
 * If any are found, returns a Response.json with an error and details.
 * Otherwise, returns null.
 */
export function checkForRestrictedFeatures(
  browseData: LessonBrowseDataByKsSchema,
): Response | null {
  const features = browseData.features;
  console.log("Checking features for restrictions:", features);
  console.log("Browse Data:", browseData);
  if (
    features &&
    (features["agf__geo_restricted"] === true ||
      features["agf__login_required"] === true ||
      features["agf__restricted_download"] === true ||
      features["agf__has_copyright_restrictions"] === true ||
      browseData.is_legacy === true)
  ) {
    console.log("Restricted features found:", features);
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
