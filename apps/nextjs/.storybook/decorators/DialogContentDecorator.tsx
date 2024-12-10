import React from "react";

import type { Decorator } from "@storybook/react";

import type { DialogTypes } from "../../src/components/AppComponents/Chat/Chat/types";
import { DialogContext } from "../../src/components/AppComponents/DialogContext";

declare module "@storybook/csf" {
  interface Parameters {
    dialogWindow?: DialogTypes;
  }
}

export const DialogContentDecorator: Decorator = (Story, { parameters }) => {
  return (
    <DialogContext.Provider
      value={{
        dialogWindow: parameters.dialogWindow ?? "",
        setDialogWindow: () => {},
        dialogProps: {},
        setDialogProps: () => {},
        openSidebar: false,
        setOpenSidebar: () => {},
      }}
    >
      <Story />
    </DialogContext.Provider>
  );
};
