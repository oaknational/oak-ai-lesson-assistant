"use client";

import * as React from "react";

import {
  OakBox,
  OakFlex,
  OakIcon,
  OakLink,
  OakSpan,
} from "@oaknational/oak-components";
import { usePathname } from "next/navigation";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { useTranslation } from "@/components/ContextProviders/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import OakIconLogo from "@/components/OakIconLogo";
import { useClerkDemoMetadata } from "@/hooks/useClerkDemoMetadata";

import { useDialog } from "../DialogContext";
import { BetaTagHeader } from "./beta-tag";
import { ChatHistory } from "./chat-history";
import { OpenSideBarButton } from "./open-side-bar-button";
import { UserOrLogin } from "./user-or-login";

export function Header() {
  const { isDemoUser, demo } = useDemoUser();
  const { t } = useTranslation();

  // Check whether clerk metadata has loaded to prevent the banner from flashing
  const clerkMetadata = useClerkDemoMetadata();

  const ailaId = usePathname().split("aila/")[1];
  const { setOpenSidebar } = useDialog();
  return (
    <OakBox
      as={"header"}
      $position={"fixed"}
      $zIndex={"banner"}
      $width={"100%"}
    >
      <OakFlex
        $alignItems={"center"}
        $justifyContent={"space-between"}
        $background="white"
      >
        <p>Translation prototype</p>
        <div className="mr-4">
          <LanguageSwitcher />
        </div>
      </OakFlex>
      {clerkMetadata.isSet && isDemoUser && (
        <OakFlex
          $alignItems={"center"}
          $bb={"border-solid-m"}
          $background={"lemon"}
          $pv={["inner-padding-ssx", "inner-padding-xs"]}
          $ph={"inner-padding-xl"}
          data-testid="demo-banner"
        >
          <OakSpan $font={["body-3", "body-2", "body-1"]}>
            <OakSpan $font={["body-3-bold", "body-2-bold", "body-1-bold"]}>
              {t("demo.createLessons", { count: demo.appSessionsPerMonth })}
            </OakSpan>{" "}
            {t("demo.contactUs")}{" "}
            <OakLink
              iconName="chevron-right"
              isTrailingIcon
              color="black"
              href={demo.contactHref}
            >
              contact us for full access
            </OakLink>
          </OakSpan>

          <OakFlex $flexGrow={1} />
          {demo.appSessionsRemaining !== undefined && (
            <OakBox $display={["none", "none", "block"]}>
              <OakSpan $font={"body-1-bold"}>
                {t("demo.remaining", {
                  remaining: demo.appSessionsRemaining,
                  total: demo.appSessionsPerMonth,
                })}
              </OakSpan>
            </OakBox>
          )}
        </OakFlex>
      )}

      <OakFlex
        $background="white"
        $bb="border-solid-m"
        $pa={"inner-padding-l"}
        $alignItems="center"
        $justifyContent="space-between"
        $gap={"all-spacing-3"}
      >
        <OakFlex $gap={"all-spacing-3"} $alignItems={"center"}>
          <OakFlex
            $alignItems={"center"}
            $justifyContent={"center"}
            $gap={"all-spacing-3"}
          >
            <OakLink href="/" aria-label="go to home page">
              <OakIconLogo />
            </OakLink>
            <OakSpan $font="heading-6">{t("common.aila")}</OakSpan>
          </OakFlex>
          <OakFlex>
            <BetaTagHeader />
          </OakFlex>
        </OakFlex>

        <OakFlex
          $alignItems="center"
          $justifyContent="flex-end"
          $gap="all-spacing-6"
        >
          <OakBox $display={["none", "flex"]}>
            <OakLink
              color="black"
              href={ailaId ? `/aila/help/?ailaId=${ailaId}` : "/aila/help"}
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <OakFlex $alignItems={"center"} $alignContent={"center"}>
                <OakIcon
                  $mr={"space-between-sssx"}
                  iconName={"question-mark"}
                />
                <OakSpan $font="body-2" $color={"black"}>
                  {t("common.help")}
                </OakSpan>
              </OakFlex>
            </OakLink>
          </OakBox>
          <OakFlex>
            <UserOrLogin />
          </OakFlex>
          <OakFlex>
            <OpenSideBarButton setOpenSidebar={setOpenSidebar} />
            <ChatHistory />
          </OakFlex>
        </OakFlex>
      </OakFlex>
    </OakBox>
  );
}
