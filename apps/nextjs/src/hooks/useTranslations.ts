import { useTranslation } from "@/components/ContextProviders/LanguageContext";

import enTranslations from "../translations/en.json";
import ukTranslations from "../translations/uk.json";

type TranslationKeys = keyof typeof ukTranslations;
type NestedTranslationKeys<T extends TranslationKeys> =
  keyof (typeof ukTranslations)[T];

/**
 * Hook that provides translations based on the current language from the LanguageContext
 * @returns Functions to get the appropriate translations
 */
export function useTranslations() {
  const { language } = useTranslation();

  /**
   * Gets a translation for a given key path
   * @param section The translation section
   * @param key The key within the section
   * @returns The translated string
   */
  function getTranslation<T extends TranslationKeys>(
    section: T,
    key: NestedTranslationKeys<T>,
  ): string {
    if (language === "uk") {
      return ukTranslations[section][key] as string;
    }

    return enTranslations[section][
      key as keyof (typeof enTranslations)[T]
    ] as string;
  }

  /**
   * Gets an entire section of translations
   * @param section The translation section
   * @returns The section of translations
   */
  function getTranslationSection<T extends TranslationKeys>(
    section: T,
  ): (typeof ukTranslations)[T] {
    if (language === "uk") {
      return ukTranslations[section];
    }

    return enTranslations[section];
  }

  return {
    getTranslation,
    getTranslationSection,
    language,
  };
}
