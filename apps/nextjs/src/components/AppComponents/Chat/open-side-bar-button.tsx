"use client";

import { OakFlex, OakSpan } from "@oaknational/oak-components";

import { Button } from "@/components/AppComponents/Chat/ui/button";
import { Icon } from "@/components/Icon";

export function OpenSideBarButton({
  setOpenSidebar,
}: Readonly<{
  setOpenSidebar: (value: boolean) => void;
}>) {
  return (
    <Button
      variant="ghost"
      data-testid="sidebar-button"
      className="flex items-center px-5"
      onClick={() => {
        setOpenSidebar(true);
      }}
    >
      <Icon icon="sidebar" size="md" />
      <OakFlex $pl={"inner-padding-ssx"} $display={["none", "flex"]}>
        <OakSpan $font={"body-2"}>Menu</OakSpan>
      </OakFlex>

      <span className="sr-only block sm:hidden">Toggle Sidebar</span>
    </Button>
  );
}
