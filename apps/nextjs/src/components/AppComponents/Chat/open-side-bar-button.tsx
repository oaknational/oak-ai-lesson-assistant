"use client";

import { OakFlex, OakSpan } from "@oaknational/oak-components";

import { Button } from "@/components/AppComponents/Chat/ui/button";
import { useTranslation } from "@/components/ContextProviders/LanguageContext";
import { Icon } from "@/components/Icon";
import useAnalytics from "@/lib/analytics/useAnalytics";

export function OpenSideBarButton({
  setOpenSidebar,
}: Readonly<{
  setOpenSidebar: (value: boolean) => void;
}>) {
  const { trackEvent } = useAnalytics();
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      data-testid="sidebar-button"
      className="flex items-center px-5"
      onClick={() => {
        setOpenSidebar(true);
        trackEvent("chat:toggle_sidebar");
      }}
    >
      <Icon icon="sidebar" size="md" />
      <OakFlex $pl={"inner-padding-ssx"} $display={["none", "flex"]}>
        <OakSpan $font={"body-2"}>{t("common.menu")}</OakSpan>
      </OakFlex>

      <span className="sr-only block sm:hidden">Toggle Sidebar</span>
    </Button>
  );
}
