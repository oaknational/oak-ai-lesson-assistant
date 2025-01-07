import React from "react";

import { Theme } from "@radix-ui/themes";
import { Decorator } from "@storybook/react";

export const RadixThemeDecorator: Decorator = (Story) => (
  <Theme>
    <Story />
  </Theme>
);
