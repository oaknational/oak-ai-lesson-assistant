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
      <OakMaxWidth $pv="spacing-72" $ph={["spacing-24", "spacing-8"]}>
        <OakFlex
          $flexDirection={["column-reverse", "row"]}
          $pv="spacing-48"
          $justifyContent="space-between"
          $width="100%"
        >
          <OakFlex
            $flexDirection={["column", "row"]}
            $alignItems={["center", "start"]}
            $gap="spacing-64"
          >
            <OakFlex
              $flexDirection="column"
              $justifyContent={["start", "center"]}
              $alignItems={"start"}
              $width={["100%", "unset"]}
            >
              <OakP $font="heading-7" $mb={"spacing-16"}>
                Menu
              </OakP>
              <OakUL>
                {aiTools.map((tool) => {
                  return (
                    <OakLI key={tool.id} $pv="spacing-4">
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
                    <OakLI key={item.id} $pv="spacing-4">
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
              <OakP $font="heading-7" $mb={"spacing-16"}>
                AI experiments legal
              </OakP>
              <OakUL>
                {legalMenuItems.map((item) => {
                  if (item.id === "manage-cookies") {
                    return (
                      <OakLI key={item.id} $pv="spacing-4">
                        <ManageCookiesButton />
                      </OakLI>
                    );
                  }
                  if (item.target) {
                    return (
                      <OakLI key={item.id} $pv="spacing-4">
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
        <OakBox $pt={["spacing-0", "spacing-48"]} $width="100%">
          <OakFlex
            $gap={["spacing-24", "spacing-72"]}
            $flexDirection={["column", "row"]}
            $alignContent="center"
            $mt={["auto", "spacing-72"]}
            $justifyContent={["center", "space-between"]}
            className="w-full"
          >
            <OakFlex $flexDirection="row" $gap="spacing-16">
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
            <OakFlex $flexDirection="column" $gap="spacing-4">
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
        $bottom="spacing-0"
        $right="spacing-0"
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
  display: block !important;
  text-decoration: none !important;
  &:hover {
    text-decoration: underline !important;
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
        $gap="spacing-4"
        $alignItems="center"
        $font="body-2"
        $color="text-primary"
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
