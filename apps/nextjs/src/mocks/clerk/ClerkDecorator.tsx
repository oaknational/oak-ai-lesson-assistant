import type { Decorator } from "@storybook/react";

import { ClerkProvider } from "./nextjsComponents";

declare module "@storybook/csf" {
  interface Parameters {
    auth?: "loading" | "signedIn" | "signedInDemo" | "signedOut";
  }
}

export const ClerkDecorator: Decorator = (Story, { parameters }) => {
  return (
    <ClerkProvider state={parameters.auth ?? "signedIn"}>
      <Story />
    </ClerkProvider>
  );
};
