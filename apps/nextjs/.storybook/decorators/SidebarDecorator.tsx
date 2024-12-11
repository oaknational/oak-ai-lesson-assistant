import React from "react";

import type { Decorator } from "@storybook/react";
import { fn } from "@storybook/test";

import { SidebarContext } from "../../src/lib/hooks/use-sidebar";

declare module "@storybook/csf" {
  interface Parameters {
    // Please fill out as we add configuration
    sidebarContext?: {};
  }
}

export const SidebarDecorator: Decorator = (Story) => (
  <SidebarContext.Provider
    value={{
      toggleSidebar: fn(),
      isLoading: false,
      isSidebarOpen: false,
    }}
  >
    <Story />
  </SidebarContext.Provider>
);
