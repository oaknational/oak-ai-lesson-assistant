"use client";

import * as React from "react";

import {
  OakBox,
  OakFlex,
  OakIcon,
  OakLink,
  OakSpan,
} from "@oaknational/oak-components";
import { useClerkDemoMetadata } from "hooks/useClerkDemoMetadata";
import { usePathname } from "next/navigation";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import OakIconLogo from "@/components/OakIconLogo";

import { useDialog } from "../DialogContext";
import { BetaTagHeader } from "./beta-tag";
import { SidebarMobile } from "./sidebar-mobile";
import { UserOrLogin } from "./user-or-login";

export function Header() {
  const demo = useDemoUser();

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
      {clerkMetadata.isSet && demo.isDemoUser && (
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
              Create {demo.appSessionsPerMonth} lessons per month •
            </OakSpan>{" "}
            If you are a teacher in the UK,{" "}
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
                {demo.appSessionsRemaining} of {demo.appSessionsPerMonth}{" "}
                lessons remaining
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
            <OakSpan $font="heading-6">Aila</OakSpan>
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
                  Help
                </OakSpan>
              </OakFlex>
            </OakLink>
          </OakBox>
          <OakFlex>
            <UserOrLogin />
          </OakFlex>
          <OakFlex>
            <SidebarMobile setOpenSidebar={setOpenSidebar} />
          </OakFlex>
        </OakFlex>
      </OakFlex>
    </OakBox>
  );
}
