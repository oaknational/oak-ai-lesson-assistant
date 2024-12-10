import React from "react";

import type { Decorator } from "@storybook/react";

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
      toggleSidebar: () => {},
      isLoading: false,
      isSidebarOpen: false,
    }}
  >
    <Story />
  </SidebarContext.Provider>
);
