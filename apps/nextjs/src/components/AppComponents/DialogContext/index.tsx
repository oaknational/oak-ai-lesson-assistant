"use client";

import React, { createContext, useState, useContext, useMemo } from "react";

import type { OakIconName } from "@oaknational/oak-components";

import type { DialogTypes } from "../Chat/Chat/types";

const dialogTitlesAndIcons: {
  [key: string]: { title: string; iconName: OakIconName };
} = {
  "share-chat": {
    title: "Share chat",
    iconName: "share",
  },
  feedback: {
    title: "Before you continue...",
    iconName: "books",
  },
  "report-content": {
    title: "Report content",
    iconName: "warning",
  },
  "sensitive-moderation-user-comment": {
    title: "Sensitive moderation user comment",
    iconName: "warning",
  },
  "demo-interstitial": {
    title: "Lesson limit reached",
    iconName: "warning",
  },
  "demo-share-locked": {
    title: "Sharing and downloading",
    iconName: "warning",
  },
};

interface DialogContextType {
  dialogWindow: DialogTypes;
  setDialogWindow: React.Dispatch<React.SetStateAction<DialogTypes>>;
  dialogTitlesAndIcons?: {
    [key: string]: { title: string; iconName: OakIconName };
  };
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [dialogWindow, setDialogWindow] = useState<DialogTypes>("");

  const value = useMemo(
    () => ({ dialogWindow, setDialogWindow }),
    [dialogWindow],
  );

  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

export { dialogTitlesAndIcons };
