import { OakFlex, OakIcon, OakP } from "@oaknational/oak-components";
import Link from "next/link";
import styled from "styled-components";

import HeaderAuth from "./HeaderAuth";
import { Logo } from "./Logo";

type HeaderProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  featureFlag: boolean | { featureFlag: boolean };
};

const HamburgerButton = styled.button`
  display: inline-block;
  width: 28px;
  height: 28px;
`;

const Header = ({
  menuOpen,
  setMenuOpen,
  featureFlag,
}: Readonly<HeaderProps>) => {
  return (
    <OakFlex
      as="header"
      $position="fixed"
      $top="all-spacing-0"
      $left="all-spacing-0"
      $right="all-spacing-0"
      $zIndex="fixed-header"
      $height="all-spacing-12"
      $width="100%"
      $bb="border-solid-s"
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
          <Logo />
        </Link>
        <OakP $font={["body-2", "heading-light-6"]}>Oak AI Experiments</OakP>
      </OakFlex>
      <OakFlex $alignItems={"center"} $gap={"all-spacing-8"}>
        {featureFlag && (
          <Link href="/faqs">
            <OakP $font="body-2">FAQs</OakP>
          </Link>
        )}

        <HeaderAuth />

        <div className="h-22 py-8">
          <HamburgerButton onClick={() => setMenuOpen(!menuOpen)}>
            <OakIcon $colorFilter={"black"} iconName="hamburger" />
          </HamburgerButton>
        </div>
      </OakFlex>
    </OakFlex>
  );
};

export default Header;
