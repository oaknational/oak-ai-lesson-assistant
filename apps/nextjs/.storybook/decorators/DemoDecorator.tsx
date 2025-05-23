import React from "react";

import type { Decorator } from "@storybook/react";
import invariant from "tiny-invariant";

import {
  DemoContext,
  type DemoContextProps,
} from "@/components/ContextProviders/Demo";

declare module "@storybook/csf" {
  interface Parameters {
    demoContext?: DemoContextProps;
  }
}

export const DemoDecorator: Decorator = (Story, { parameters }) => {
  const value = parameters.demoContext;
  invariant(
    value,
    "DemoDecorator requires a DemoContext. Please call ...demoParams() in the parameters",
  );

  return (
    <DemoContext.Provider value={value}>
      <Story />
    </DemoContext.Provider>
  );
};

const demoBase: DemoContextProps["demo"] = {
  appSessionsRemaining: 2,
  additionalMaterialsSessionsRemaining: 1,
  appSessionsPerMonth: 3,
  contactHref: "https://share.hsforms.com/1R9ulYSNPQgqElEHde3KdhAbvumd",
};

type DemoParams = {
  isDemoUser: boolean;
  demo?: Partial<DemoContextProps["demo"]>;
  isSharingEnabled?: boolean;
};
export const demoParams = (
  args: DemoParams,
): { demoContext: DemoContextProps } => {
  const isSharingEnabled = args.isSharingEnabled ?? true;

  const context: DemoContextProps = args.isDemoUser
    ? {
        isDemoUser: true,
        demo: { ...demoBase, ...args.demo },
        isSharingEnabled,
      }
    : {
        isDemoUser: false,
        demo: undefined,
        isSharingEnabled,
      };

  return {
    demoContext: context,
  };
};
