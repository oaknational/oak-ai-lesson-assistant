import type { Decorator } from "@storybook/react/*";

import { ClerkProvider } from "./nextjsComponents";

export const ClerkDecorator: Decorator = (Story, { parameters }) => {
  return (
    <ClerkProvider state={parameters.auth ?? "signedIn"}>
      <Story />
    </ClerkProvider>
  );
};
