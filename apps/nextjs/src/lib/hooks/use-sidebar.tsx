"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

const LOCAL_STORAGE_KEY = "sidebar";

export interface SidebarContext {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
}

export const SidebarContext = createContext<SidebarContext | undefined>(
  undefined,
);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

export interface SidebarProviderProps {
  readonly children: React.ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const value = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (value) {
      setIsSidebarOpen(false);
    }
    setIsLoading(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((value) => {
      const newState = !value;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, [setIsSidebarOpen]);

  const contextValue = useMemo(() => {
    return { isSidebarOpen, toggleSidebar, isLoading };
  }, [isSidebarOpen, isLoading, toggleSidebar]);

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}
