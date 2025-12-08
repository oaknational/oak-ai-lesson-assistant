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
import OakIconLogo from "@/components/OakIconLogo";
import { useClerkDemoMetadata } from "@/hooks/useClerkDemoMetadata";

import { useDialog } from "../DialogContext";
import { BetaTagHeader } from "./beta-tag";
import { ChatHistory } from "./chat-history";
import { DemoBanner } from "./demo-banner";
import { OpenSideBarButton } from "./open-side-bar-button";
import { UserOrLogin } from "./user-or-login";

export function Header({ page }: { page?: "teachingMaterials" | "aila" }) {
  const { isDemoUser, demo } = useDemoUser();

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
      {clerkMetadata.isSet && isDemoUser && page && (
        <DemoBanner
          page={page}
          monthlyLimit={demo.appSessionsPerMonth}
          remaining={
            page == "teachingMaterials"
              ? demo.additionalMaterialsSessionsRemaining
              : demo.appSessionsRemaining
          }
          contactHref={demo.contactHref}
        />
      )}
      <OakFlex
        $background="white"
        $bb="border-solid-m"
        $pa={"spacing-20"}
        $alignItems="center"
        $justifyContent="space-between"
        $gap={"spacing-12"}
      >
        <OakFlex $gap={"spacing-12"} $alignItems={"center"}>
          <OakFlex
            $alignItems={"center"}
            $justifyContent={"center"}
            $gap={"spacing-12"}
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
          $gap="spacing-24"
        >
          <OakBox $display={["none", "flex"]}>
            <OakLink
              color="black"
              href={ailaId ? `/aila/help/?ailaId=${ailaId}` : "/aila/help"}
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <OakFlex $alignItems={"center"} $alignContent={"center"}>
                <OakIcon $mr={"spacing-4"} iconName={"question-mark"} />
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
            <OpenSideBarButton setOpenSidebar={setOpenSidebar} />
            <ChatHistory />
          </OakFlex>
        </OakFlex>
      </OakFlex>
    </OakBox>
  );
}
