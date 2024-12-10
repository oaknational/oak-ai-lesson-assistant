import React from "react";

import type { Decorator } from "@storybook/react";

import {
  DemoContext,
  type DemoContextProps,
} from "@/components/ContextProviders/Demo";

declare module "@storybook/csf" {
  interface Parameters {
    // DemoContext is a discriminated union, which doesn't work with extensible config
    // Instead, allow all props together
    demoContext?: {
      isDemoUser?: boolean;
      demo?: Partial<DemoContextProps["demo"]>;
      isSharingEnabled?: boolean;
    };
  }
}

const demoBase: DemoContextProps["demo"] = {
  appSessionsRemaining: 2,
  appSessionsPerMonth: 3,
  contactHref: "https://share.hsforms.com/1R9ulYSNPQgqElEHde3KdhAbvumd",
};

export const DemoDecorator: Decorator = (Story, { parameters }) => {
  const demo = { ...demoBase, ...parameters.demoContext?.demo };
  const isSharingEnabled = parameters.demoContext?.isSharingEnabled ?? true;

  const isDemo =
    parameters.demoContext &&
    "isDemoUser" in parameters.demoContext &&
    parameters.demoContext.isDemoUser;

  const value = isDemo
    ? { isDemoUser: true as const, demo, isSharingEnabled }
    : { isDemoUser: false as const, isSharingEnabled };

  return (
    <DemoContext.Provider value={value}>
      <Story />
    </DemoContext.Provider>
  );
};
