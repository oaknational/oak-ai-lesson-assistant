"use client";

import { OakThemeProvider, oakDefaultTheme } from "@oaknational/oak-components";

import { TooltipProvider } from "@/components/AppComponents/Chat/ui/tooltip";
import { DemoProvider } from "@/components/ContextProviders/Demo";
import { SidebarProvider } from "@/lib/hooks/use-sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OakThemeProvider theme={oakDefaultTheme}>
      <SidebarProvider>
        <TooltipProvider>
          <DemoProvider>{children}</DemoProvider>
        </TooltipProvider>
      </SidebarProvider>
    </OakThemeProvider>
  );
}
