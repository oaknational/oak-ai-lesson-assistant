"use client";

import { useAuth } from "@clerk/nextjs";
import {
  OakBox,
  OakFlex,
  OakIcon,
  OakLI,
  OakLink,
  OakMaxWidth,
  OakP,
  OakUL,
  useCookieConsent,
} from "@oaknational/oak-components";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import loop from "@/assets/svg/loop.svg";
import { aiTools } from "@/data/aiTools";
import { legalMenuItems, menuItems, socialMenuItems } from "@/data/menus";
import useAnalytics from "@/lib/analytics/useAnalytics";

import { ScaleSpan } from "./AppComponents/ScaleSpan";
import { Logo } from "./Logo";

function ManageCookiesButton() {
  const { openSettings } = useCookieConsent();
  return <FooterButton onClick={openSettings}>Manage cookies</FooterButton>;
}

const Footer = () => {
  const { track } = useAnalytics();
  const { isSignedIn } = useAuth();
  return (
    <StyledFooter>
      <OakMaxWidth
        $pv="inner-padding-xl7"
        $ph={["inner-padding-xl", "inner-padding-xs"]}
      >
        <OakFlex
          $flexDirection={["column-reverse", "row"]}
          $pv="inner-padding-xl4"
          $justifyContent="space-between"
          $width="100%"
        >
          <OakFlex
            $flexDirection={["column", "row"]}
            $alignItems={["center", "start"]}
            $gap="all-spacing-11"
          >
            <OakFlex
              $flexDirection="column"
              $justifyContent={["start", "center"]}
              $alignItems={"start"}
              $width={["100%", "unset"]}
            >
              <OakP $font="heading-7" $mb={"space-between-s"}>
                Menu
              </OakP>
              <OakUL>
                {aiTools.map((tool) => {
                  return (
                    <OakLI key={tool.id} $pv="inner-padding-ssx">
                      <FooterButton
                        onClick={() => {
                          if (tool.id === "lesson-planner") {
                            track.lessonAssistantAccessed({
                              product: "ai lesson assistant",
                              isLoggedIn: !!isSignedIn,
                              componentType: "footer_menu_link",
                            });
                          }
                        }}
                        href={tool.href}
                      >
                        {tool.title}
                      </FooterButton>
                    </OakLI>
                  );
                })}
                {menuItems.map((item) => {
                  return (
                    <OakLI key={item.id} $pv="inner-padding-ssx">
                      <FooterButton href={item.href} disabled={!item.href}>
                        {item.title}
                      </FooterButton>
                    </OakLI>
                  );
                })}
              </OakUL>
            </OakFlex>
            <OakFlex
              $flexDirection="column"
              $justifyContent={["start", "center"]}
              $alignItems={"start"}
              $width={["100%", "unset"]}
            >
              <OakP $font="heading-7" $mb={"space-between-s"}>
                AI experiments legal
              </OakP>
              <OakUL>
                {legalMenuItems.map((item) => {
                  if (item.id === "manage-cookies") {
                    return (
                      <OakLI key={item.id} $pv="inner-padding-ssx">
                        <ManageCookiesButton />
                      </OakLI>
                    );
                  }
                  if (item.target) {
                    return (
                      <OakLI key={item.id} $pv="inner-padding-ssx">
                        <FooterButton href={item.href} target={item.target}>
                          {item.title}
                        </FooterButton>
                      </OakLI>
                    );
                  }
                  return (
                    <li key={item.id} className="my-6 text-left">
                      <FooterButton href={item.href} target={item.target}>
                        {item.title}
                      </FooterButton>
                    </li>
                  );
                })}
              </OakUL>
            </OakFlex>
          </OakFlex>

          <OakBox $display={["none", "flex"]}>
            <Logo width={150} height={100} />
          </OakBox>
        </OakFlex>
        <OakBox $pt={["inner-padding-none", "inner-padding-xl4"]} $width="100%">
          <OakFlex
            $gap={["all-spacing-6", "all-spacing-12"]}
            $flexDirection={["column", "row"]}
            $alignContent="center"
            $mt={["auto", "space-between-xxl"]}
            $justifyContent={["center", "space-between"]}
            className="w-full"
          >
            <OakFlex $flexDirection="row" $gap="all-spacing-4">
              {socialMenuItems.map((item) => {
                return (
                  <a href={item.href} key={item.id}>
                    <OakIcon iconName={item.icon} />
                  </a>
                );
              })}
            </OakFlex>
            <OakBox $display={["flex", "none"]}>
              <Logo width={150} height={100} />
            </OakBox>
            <OakFlex $flexDirection="column" $gap="all-spacing-1">
              <p className="text-sm font-bold">
                © Oak National Academy Limited, No 14174888
              </p>
              <p className="text-sm">
                1 Scott Place, 2 Hardman Street, Manchester, M3 3AA
              </p>
            </OakFlex>
          </OakFlex>
        </OakBox>
      </OakMaxWidth>
      <OakBox
        $position="absolute"
        $bottom="all-spacing-0"
        $right="all-spacing-0"
        $zIndex="behind"
      >
        <Image src={loop} width={821} height={577} alt="loop" priority={true} />
      </OakBox>
    </StyledFooter>
  );
};

export default Footer;

const StyledFooter = styled.footer`
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: white;
`;

const StyledOakLink = styled(OakLink)`
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export type FooterButtonProps = Readonly<{
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  target?: string;
  children: React.ReactNode;
}>;

const FooterButton = ({
  href,
  onClick,
  disabled,
  target,
  children,
}: FooterButtonProps) => {
  const element = href ? Link : "button";
  return (
    <StyledOakLink
      href={href ?? ""}
      onClick={onClick}
      element={element}
      target={target}
      disabled={disabled}
    >
      <OakFlex
        $gap="all-spacing-1"
        $alignItems="center"
        $font="body-2"
        $color="black"
        $textDecoration="none"
      >
        <span>{children}</span>
        {href?.includes("http") && (
          <ScaleSpan $scale={0.8}>
            <OakIcon iconName="external" />
          </ScaleSpan>
        )}
      </OakFlex>
    </StyledOakLink>
  );
};
