"use client";

import { OakFlex, OakSpan } from "@oaknational/oak-components";

import { Sidebar } from "@/components/AppComponents/Chat/sidebar";
import { Button } from "@/components/AppComponents/Chat/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/AppComponents/Chat/ui/sheet";
import { Icon } from "@/components/Icon";
import useAnalytics from "@/lib/analytics/useAnalytics";

interface SidebarMobileProps {
  children: React.ReactNode;
}

export function SidebarMobile({ children }: Readonly<SidebarMobileProps>) {
  const { trackEvent } = useAnalytics();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          data-testid="sidebar-button"
          className="flex items-center px-5"
          onClick={() => {
            trackEvent("chat:toggle_sidebar");
          }}
        >
          <Icon icon="sidebar" size="md" />
          <OakFlex $pl={"inner-padding-ssx"} $display={["none", "flex"]}>
            <OakSpan $font={"body-2"}>Menu</OakSpan>
          </OakFlex>

          <span className="sr-only block sm:hidden">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="inset-y-0 flex h-auto w-full flex-col p-0 sm:w-[300px]"
      >
        <Sidebar className="flex">{children}</Sidebar>
      </SheetContent>
    </Sheet>
  );
}
