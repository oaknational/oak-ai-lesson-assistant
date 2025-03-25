"use client";

import React from "react";

import { usePathname } from "next/navigation";

import type { Language } from "./ContextProviders/LanguageContext";
import { useTranslation } from "./ContextProviders/LanguageContext";

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  // check the url to see if it includes an id or if it is just /aila
  const pathname = usePathname();
  const hasIdAndIsNotHome =
    pathname.split("/")[pathname.split("/").length - 1] !== "aila";

  const toggleLanguage = () => {
    const newLanguage: Language = language === "en" ? "uk" : "en";
    setLanguage(newLanguage);
  };
  console.log("language", language);
  if (hasIdAndIsNotHome) {
    return (
      <div className="flex flex-row gap-2">
        <p>
          This lesson is being conducted in{" "}
          {language === "en" ? "🇬🇧 English" : "🇺🇦 Ukrainian"}
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-row gap-20">
      <p className="text-sm">
        This lesson is being conducted in{" "}
        {language === "en" ? "🇬🇧 English" : "🇺🇦 Ukrainian"}
      </p>
      <button
        onClick={toggleLanguage}
        className="focus:ring-blue-300 rounded-md px-3 py-1 text-blue focus:outline-none focus:ring-2"
      >
        Translate to {language === "en" ? "🇺🇦 Ukrainian" : "🇬🇧 English"}
      </button>
    </div>
  );
};
