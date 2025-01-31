import React, { useEffect } from "react";

import type { Decorator } from "@storybook/react";

import { useModerationStore } from "@/stores/AilaStoresProvider";

import { type ModerationStore } from "../../src/stores/moderationStore";

declare module "@storybook/csf" {
  interface Parameters {
    moderationStoreState?: Partial<ModerationStore>;
  }
}

export const ModerationStoreDecorator: Decorator = (Story, { parameters }) => {
  const reset = useModerationStore((state) => state.reset);

  useEffect(() => {
    if (!parameters.moderationStoreState) {
      return;
    }
    reset({
      ...parameters.moderationStoreState,
    });
  }, [reset]);

  return <Story />;
};
