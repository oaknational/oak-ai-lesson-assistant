import {
  OakBox,
  OakFlex,
  OakHandDrawnHR,
  OakIcon,
  OakP,
  OakSpan,
  OakTypography,
} from "@oaknational/oak-components";
import Link from "next/link";
import styled from "styled-components";

import HeaderAuth from "./HeaderAuth";
import { Logo } from "./Logo";
import OakIconLogo from "./OakIconLogo";

type HeaderProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

const HamburgerButton = styled.button`
  display: inline-block;
  width: 28px;
  height: 28px;
`;

const Header = ({ menuOpen, setMenuOpen }: Readonly<HeaderProps>) => {
  return (
    <OakBox
      $position="absolute"
      $top="all-spacing-0"
      $left="all-spacing-0"
      $right="all-spacing-0"
      $zIndex="fixed-header"
    >
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
      <OakBox $background={"lemon"} $height={"all-spacing-1"}>
        <OakHandDrawnHR hrColor={"black"} $height={"all-spacing-1"} />
      </OakBox>
      <OakBox role="banner">
        <OakFlex
          $background={"lemon"}
          $justifyContent={["center"]}
          $alignItems={"center"}
          $pv={"inner-padding-s"}
          $ph={["inner-padding-s", "inner-padding-m"]}
        >
          <OakFlex
            $alignItems={"center"}
            $flexWrap={"wrap"}
            $gap={["all-spacing-4", "all-spacing-8"]}
            $flexDirection={["column", "row"]}
            $justifyContent={"center"}
            $pv={"inner-padding-none"}
          >
            <OakTypography $font={["body-3", "body-2"]} $textAlign={"center"}>
              Want to learn more about integrating AI into your teaching
              practices?{" "}
              <Link
                href="https://share.hsforms.com/1USsrkazESq2Il8lxUx_vPgbvumd"
                target="_blank"
              >
                <OakSpan $textDecoration={"underline"}>
                  Sign up for our webinar
                </OakSpan>
              </Link>
              .
            </OakTypography>
          </OakFlex>
        </OakFlex>
        <OakBox $background={"lemon"} $height={"all-spacing-1"}>
          <OakHandDrawnHR hrColor={"black"} $height={"all-spacing-1"} />
        </OakBox>
      </OakBox>
    </OakBox>
  );
};

export default Header;
