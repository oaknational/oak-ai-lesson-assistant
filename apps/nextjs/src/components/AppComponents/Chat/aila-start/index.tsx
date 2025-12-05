"use client";

import { useUser } from "@clerk/nextjs";
import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakLI,
  OakMaxWidth,
  OakP,
  OakPrimaryButton,
  OakUL,
} from "@oaknational/oak-components";
import Link from "next/link";
import styled from "styled-components";

import useAnalytics from "@/lib/analytics/useAnalytics";
import { getAilaUrl } from "@/utils/getAilaUrl";

import ChatPanelDisclaimer from "../chat-panel-disclaimer";
import EmptyScreenAccordion from "../empty-screen-accordion";

const StyledUL = styled(OakUL)`
  list-style-type: disc;

  padding-left: 20px;
`;

export function AilaStart() {
  const { track } = useAnalytics();
  const { user } = useUser();

  return (
    <OakFlex
      $background="bg-decorative3-very-subdued"
      $flexDirection="column"
      $alignItems="center"
      $minHeight={["100%", "100vh", "100vh"]}
    >
      <OakMaxWidth
        $mt={["space-between-xxxl"]}
        $maxWidth="all-spacing-23"
        $background="bg-decorative3-very-subdued"
        $justifyContent={"space-between"}
      >
        <OakGrid
          $height={"100%"}
          $cg={["space-between-none", "space-between-m", "space-between-l"]}
          $rg={["space-between-l", "space-between-none", "space-between-none"]}
          $mh="auto"
          $mt={["space-between-xxxl"]}
          $ph={["inner-padding-s", "inner-padding-s", "inner-padding-none"]}
        >
          <OakGridArea $alignContent={"center"} $colSpan={[12, 6, 7]}>
            <OakBox
              $background="bg-primary"
              $pa="inner-padding-xl2"
              $borderRadius="border-radius-s"
              $position={"relative"}
            >
              <OakFlex $flexDirection="column">
                {/* Heading and description */}
                <OakHeading $mb="space-between-s" $font="heading-5" tag="h2">
                  Create a lesson with AI
                </OakHeading>
                <OakP $mb="space-between-s" $font="body-2">
                  Aila will guide you step-by-step to create and download a
                  tailor-made lesson, including:
                </OakP>

                <EmptyScreenAccordion />
                <OakBox $mt="space-between-l">
                  <OakPrimaryButton
                    element={Link}
                    href={getAilaUrl("lesson")}
                    iconName="arrow-right"
                    isTrailingIcon={true}
                  >
                    Create a lesson
                  </OakPrimaryButton>
                </OakBox>
              </OakFlex>
            </OakBox>
          </OakGridArea>
          <OakGridArea $colSpan={[12, 6, 5]}>
            <OakBox
              $background="bg-primary"
              $pa="inner-padding-xl2"
              $borderRadius="border-radius-s"
            >
              <OakFlex $flexDirection="column">
                {/* Heading, description, and list */}
                <OakHeading $mb="space-between-xs" $font="heading-5" tag="h2">
                  Create teaching materials with AI
                </OakHeading>
                <OakP $mb="space-between-xs" $font="body-2">
                  Enhance lessons with a range of teaching materials, including:
                </OakP>
                <StyledUL>
                  <OakLI $mv="space-between-xs">Glossaries</OakLI>
                  <OakLI $mv="space-between-xs">Comprehension tasks</OakLI>
                  <OakLI $mt="space-between-xs">Quizzes</OakLI>
                </StyledUL>
                <OakBox $mt="space-between-m">
                  <OakPrimaryButton
                    element={Link}
                    href={getAilaUrl("teaching-materials")}
                    data-testid={"create-teaching-materials-button"}
                    iconName="arrow-right"
                    isTrailingIcon={true}
                    onClick={() => {
                      track.createTeachingMaterialsInitiated({
                        platform: "aila-beta",
                        product: "ai lesson assistant",
                        engagementIntent: "explore",
                        componentType: "create_additional_materials_button",
                        eventVersion: "2.0.0",
                        analyticsUseCase: "Teacher",
                        isLoggedIn: Boolean(user),
                      });
                    }}
                  >
                    Create teaching materials
                  </OakPrimaryButton>
                </OakBox>
              </OakFlex>
            </OakBox>
          </OakGridArea>
        </OakGrid>
        <OakFlex
          $ph={["inner-padding-s", "inner-padding-s", "inner-padding-none"]}
          $justifyContent={"center"}
        >
          <OakBox $mt="space-between-l">
            <ChatPanelDisclaimer size="sm" />
          </OakBox>
        </OakFlex>
      </OakMaxWidth>
    </OakFlex>
  );
}
