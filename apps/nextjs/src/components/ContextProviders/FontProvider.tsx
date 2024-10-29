"use client";

import type {
  Dispatch} from "react";
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

interface FontContextProps {
  fontClass: string;
  setFontClass: Dispatch<React.SetStateAction<string>>;
}

const FontContext = createContext<FontContextProps | null>(null);

export type FontProviderProps = { children: React.ReactNode };

export const FontProvider = ({ children }: Readonly<FontProviderProps>) => {
  const [fontClass, setFontClass] = useState("Lexend");

  const value = useMemo(() => {
    return { fontClass, setFontClass };
  }, [fontClass, setFontClass]);
  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
};

export const useFont = (): FontContextProps => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
};

export default FontProvider;
