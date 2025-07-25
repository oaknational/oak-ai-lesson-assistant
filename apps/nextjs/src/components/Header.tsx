import { OakBox, OakFlex, OakIcon, OakP } from "@oaknational/oak-components";
import Link from "next/link";
import styled from "styled-components";

import { useClerkDemoMetadata } from "@/hooks/useClerkDemoMetadata";

import { DemoBanner } from "./AppComponents/Chat/demo-banner";
import { useDemoUser } from "./ContextProviders/Demo";
import HeaderAuth from "./HeaderAuth";
import { Logo } from "./Logo";
import OakIconLogo from "./OakIconLogo";

type HeaderProps = {
  menuOpen: boolean;
  page?: "teachingMaterials" | "aila";
  setMenuOpen: (open: boolean) => void;
};

const HamburgerButton = styled.button`
  display: inline-block;
  width: 28px;
  height: 28px;
`;

const Header = ({ menuOpen, setMenuOpen, page }: Readonly<HeaderProps>) => {
  const { isDemoUser, demo } = useDemoUser();

  // Check whether clerk metadata has loaded to prevent the banner from flashing
  const clerkMetadata = useClerkDemoMetadata();
  return (
    <OakBox
      $position="absolute"
      $top="all-spacing-0"
      $left="all-spacing-0"
      $right="all-spacing-0"
      $zIndex="fixed-header"
      $bb={"border-solid-m"}
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
        as="header"
        $height="all-spacing-12"
        $width="100%"
        $background="white"
        $ph="inner-padding-m"
        $justifyContent="space-between"
      >
        <OakFlex
          $flexDirection="row"
          $alignItems={"center"}
          $gap={["all-spacing-5", "all-spacing-7"]}
        >
          <Link href="/" aria-label="go to home page">
            <OakBox $display={["none", "block"]}>
              <Logo />
            </OakBox>
            <OakBox $display={["block", "none"]}>
              <OakIconLogo />
            </OakBox>
          </Link>
          <OakBox $display={["none", "block"]}>
            <OakP $font={["body-2", "heading-6"]}>AI experiments</OakP>
          </OakBox>
        </OakFlex>
        <OakFlex
          $alignItems={"center"}
          $gap={["all-spacing-4", "all-spacing-8"]}
        >
          <OakBox $display={["none", "block"]}>
            <Link href="/faqs">
              <OakP $font="body-2">FAQs</OakP>
            </Link>
          </OakBox>

          <HeaderAuth />

          <div className="h-22 py-8">
            <HamburgerButton onClick={() => setMenuOpen(!menuOpen)}>
              <OakIcon $colorFilter={"black"} iconName="hamburger" />
            </HamburgerButton>
          </div>
        </OakFlex>
      </OakFlex>
    </OakBox>
  );
};

export default Header;
