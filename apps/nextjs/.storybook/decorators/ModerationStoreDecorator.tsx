import React from "react";

import type { Decorator } from "@storybook/react";
import { handleToxicModeration } from "src/stores/moderationStore/actionFunctions/handleToxicModeration";
import { handleUpdateModerationState } from "src/stores/moderationStore/actionFunctions/handleUpdateModerationState";
import { create, type StoreApi } from "zustand";

import {
  createModerationStore,
  ModerationStoreContext,
  type ModerationStore,
} from "../../src/stores/moderationStore/index";

declare module "@storybook/csf" {
  interface Parameters {
    moderationStoreContext?: Partial<ModerationStore>;
  }
}

export const ModerationStoreDecorator: Decorator = (Story, { parameters }) => {
  const [store] = React.useState(() =>
    createModerationStore(parameters.moderationStoreContext),
  );

  return (
    <ModerationStoreContext.Provider value={store}>
      <Story />
    </ModerationStoreContext.Provider>
  );
};
