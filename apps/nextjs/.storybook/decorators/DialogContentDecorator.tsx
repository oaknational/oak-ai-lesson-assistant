import React from "react";

import type { Decorator } from "@storybook/react";
import { fn } from "@storybook/test";

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
        setDialogWindow: fn(),
        dialogProps: {},
        setDialogProps: fn(),
        openSidebar: false,
        setOpenSidebar: fn(),
      }}
    >
      <Story />
    </DialogContext.Provider>
  );
};
