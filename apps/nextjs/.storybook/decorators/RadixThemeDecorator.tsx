import React from "react";

import { Theme } from "@radix-ui/themes";

export const RadixThemeDecorator = (Story: React.ComponentType) => (
  <Theme>
    <Story />
  </Theme>
);
