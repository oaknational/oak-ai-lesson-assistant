"use client";

import React, { createContext, useContext, useState } from "react";

import { z } from "zod";

import englishTranslations from "../../translations/en.json";
import ukrainianTranslations from "../../translations/uk.json";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Define available languages
export const languageSchema = z.enum(["en", "uk"]);
export type Language = z.infer<typeof languageSchema>;

// Define the context shape
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: () => "",
});

// Type for the provider props
type LanguageProviderProps = {
  children: React.ReactNode;
};

// Translation function
const getTranslation = (
  lang: Language,
  key: string,
  replacements?: Record<string, string | number>,
): string => {
  const translations =
    lang === "en" ? englishTranslations : ukrainianTranslations;

  // Split the key by dot notation to navigate nested objects
  const keys = key.split(".");
  let value: any = translations;

  // Traverse the translations object
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // Key not found, return the key itself
      return key;
    }
  }

  // If we found a string value, apply any replacements
  if (typeof value === "string" && replacements) {
    return Object.entries(replacements).reduce(
      (result, [replaceKey, replaceValue]) => {
        return result.replace(
          new RegExp(`{${replaceKey}}`, "g"),
          String(replaceValue),
        );
      },
      value,
    );
  }

  return typeof value === "string" ? value : key;
};

// Create the provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  // Get the language from environment variable or default to English
  // In a real implementation, this might come from localStorage, user preferences, etc.
  const defaultLanguage = "en";
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  // Expose the translation function
  const t = (key: string, replacements?: Record<string, string | number>) => {
    return getTranslation(language, key, replacements);
  };

  // Return the provider with the current language, setter, and translation function
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
