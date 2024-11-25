"use client";

import React, { createContext, useState, useContext, useMemo } from "react";

import type { DialogTypes } from "../Chat/Chat/types";

interface DialogContextType {
  dialogWindow: DialogTypes;
  setDialogWindow: React.Dispatch<React.SetStateAction<DialogTypes>>;
}

export const DialogContext = createContext<DialogContextType | undefined>(
  undefined,
);

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
