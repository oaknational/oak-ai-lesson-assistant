import React from "react";

import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

export const ThemeDecorator = (Story: React.ComponentType) => (
  <Theme>
    <Story />
  </Theme>
);
