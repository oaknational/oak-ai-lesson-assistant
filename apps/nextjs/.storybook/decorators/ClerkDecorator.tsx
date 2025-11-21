import type { Decorator } from "@storybook/nextjs";

import { ClerkProvider } from "../../src/mocks/clerk/nextjsComponents";

declare module "@storybook/nextjs" {
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
