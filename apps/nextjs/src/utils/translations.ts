import type { LessonPlanKey } from "@oakai/aila/src/protocol/schema";

import ukTranslations from "../translations/uk.json";

/**
 * Gets the translated section title for a lesson plan section key
 * @param sectionKey The lesson plan section key
 * @returns The translated section title
 */
export function getTranslatedSectionTitle(sectionKey: LessonPlanKey): string {
  // First try to get the translation from the accordion.sections object
  const sectionTranslation =
    ukTranslations.accordion.sections[
      sectionKey as keyof typeof ukTranslations.accordion.sections
    ];

  if (sectionTranslation) {
    return sectionTranslation;
  }

  // If not found, check in progressDropdown for the camelCase version
  const camelCaseKey = sectionKey.charAt(0).toLowerCase() + sectionKey.slice(1);
  const dropdownTranslation =
    ukTranslations.progressDropdown[
      camelCaseKey as keyof typeof ukTranslations.progressDropdown
    ];

  if (dropdownTranslation) {
    return dropdownTranslation;
  }

  // Fallback to looking for the exact key in progressDropdown
  const exactKeyTranslation =
    ukTranslations.progressDropdown[
      sectionKey as keyof typeof ukTranslations.progressDropdown
    ];

  if (exactKeyTranslation) {
    return exactKeyTranslation;
  }

  // Check our hardcoded fallback map
  const fallbackTranslation = lessonPlanKeyTranslations[sectionKey];
  if (fallbackTranslation) {
    return fallbackTranslation;
  }

  // Last resort: format the key for display (remove camelCase, add spaces)
  return sectionKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Map of common lesson plan keys to their Ukrainian translations
 * This serves as a fallback for keys that might not be in the translations file
 */
export const lessonPlanKeyTranslations: Record<string, string> = {
  // Main sections
  Title: "Заголовок",
  Keystage: "Ключовий етап",
  Subject: "Предмет",
  Priorknowledge: "Попередні знання",
  Keylearningpoints: "Ключові навчальні моменти",
  Misconceptions: "Помилкові уявлення",
  Keywords: "Ключові слова",
  Starterquiz: "Стартовий тест",
  Exitquiz: "Підсумковий тест",
  Learningoutcome: "Навчальні цілі",
  Learningcycles: "Навчальні цикли",
  Learningcycle1: "Навчальний цикл 1",
  Learningcycle2: "Навчальний цикл 2",
  Learningcycle3: "Навчальний цикл 3",
  Learningcycle4: "Навчальний цикл 4",
  Learningcycle5: "Навчальний цикл 5",
  // Additional sections
  additionalMaterials: "Додаткові матеріали",
  LearningCycleOutcomes: "Результати навчального циклу",
  lessonDetails: "Деталі уроку",
  lessonPlan: "План уроку",
};

/**
 * Debug function to check if all section keys have translations
 * @param keys Array of section keys to check
 * @returns Object with translations for each key
 */
export function debugSectionTranslations(
  keys: LessonPlanKey[],
): Record<string, string> {
  const results: Record<string, string> = {};

  keys.forEach((key) => {
    const translation = getTranslatedSectionTitle(key);
    results[key] = translation;
  });

  return results;
}
