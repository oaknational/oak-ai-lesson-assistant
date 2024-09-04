"use client";

import { useAuth } from "@clerk/nextjs";
import {
  OakBox,
  OakFlex,
  OakLink,
  OakMaxWidth,
  OakSpan,
  useCookieConsent,
  OakIconName,
  OakP,
  OakUL,
  OakLI,
} from "@oaknational/oak-components";
import { aiTools } from "data/aiTools";
import { legalMenuItems, menuItems, socialMenuItems } from "data/menus";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import loop from "@/assets/svg/loop.svg";
import useAnalytics from "@/lib/analytics/useAnalytics";

import { Icon } from "./Icon";
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
              <OakP $font="body-1" $mb={"space-between-s"}>
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
              <OakP $font="body-1" $mb={"space-between-s"}>
                AI Experiments Legal
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
                        <FooterButton
                          href={item.href}
                          target={item.target}
                          icon="external"
                        >
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

          <OakFlex $flexDirection="row" $justifyContent="center">
            <Logo width={150} height={100} />
          </OakFlex>
        </OakFlex>
        <OakBox $pt={["inner-padding-none", "inner-padding-xl4"]} $width="100%">
          <OakFlex
            $flexDirection={["column-reverse", "row"]}
            $gap="all-spacing-12"
            $alignContent="center"
            $justifyContent="space-between"
            className="w-full"
          >
            <OakFlex
              $gap="all-spacing-12"
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
                      <Icon icon={item.icon} size="md" />
                    </a>
                  );
                })}
              </OakFlex>
              <OakFlex $flexDirection="column" $gap="all-spacing-2">
                <p className="text-sm font-bold">
                  © Oak National Academy Limited, No 14174888
                </p>
                <p className="text-sm">
                  1 Scott Place, 2 Hardman Street, Manchester, M3 3AA
                </p>
              </OakFlex>
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
const FooterButton = ({
  href,
  onClick,
  disabled,
  target,
  icon,
  children,
}: {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  target?: string;
  icon?: OakIconName;
  children: React.ReactNode;
}) => {
  const element = href ? Link : "button";
  return (
    <StyledOakLink
      href={href ?? ""}
      onClick={onClick}
      element={element}
      target={target}
      disabled={disabled}
      iconName={icon}
      isTrailingIcon={true}
    >
      <OakSpan $font="body-2-bold" $color="black" $textDecoration="none">
        {children}
      </OakSpan>
    </StyledOakLink>
  );
};
