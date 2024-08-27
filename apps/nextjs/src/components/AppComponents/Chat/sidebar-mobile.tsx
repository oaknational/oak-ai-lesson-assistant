"use client";

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
          className="-ml-7 flex h-19 w-19 p-0 "
          onClick={() => {
            trackEvent("chat:toggle_sidebar");
          }}
        >
          <Icon icon="sidebar" size="md" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="inset-y-0 flex h-auto w-[300px] flex-col p-0">
        <Sidebar className="flex">{children}</Sidebar>
      </SheetContent>
    </Sheet>
  );
}
