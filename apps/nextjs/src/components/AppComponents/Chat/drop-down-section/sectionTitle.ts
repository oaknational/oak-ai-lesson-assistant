import type { LessonPlanKey } from "@oakai/aila/src/protocol/schema";
import { camelCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";

import { getTranslatedSectionTitle } from "@/utils/translations";

/**
 * Get the section title in the appropriate language
 * @param str The section key
 * @param languageCode The current language code (en/uk)
 * @returns The formatted section title
 */
export function sectionTitle(str: string, languageCode?: string): string {
  // Use Ukrainian translations if the language code is 'uk'
  if (languageCode === "uk") {
    return getTranslatedSectionTitle(str as LessonPlanKey);
  }

  // Default English behavior
  if (str.startsWith("cycle")) {
    return "Learning cycle " + str.split("cycle")[1];
  }

  return camelCaseToSentenceCase(str);
}
