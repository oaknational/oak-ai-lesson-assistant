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

import ChatPanelDisclaimer from "../chat-panel-disclaimer";
import EmptyScreenAccordion from "../empty-screen-accordion";

const StyledUL = styled(OakUL)`
  list-style-type: disc;
  /* margin-top: 1em; */

  /* margin-left: 40px; */
  padding-left: 20px;
`;

export function AilaStart() {
  const { track } = useAnalytics();
  const { user } = useUser();

  return (
    <OakFlex
      $background="lavender30"
      $flexDirection="column"
      $alignItems="center"
      // $width="100%"
      // $flexGrow="1"
      // $ph={["inner-padding-xl8"]}
      // $pt={"inner-padding-m"}
      // $justifyContent="flex-start"
      // $alignItems={"center"} // This centers horizontally in a column flex
      // $justifyContent={"flex-start"}
      $minHeight={["100%", "100vh", "100vh"]}
    >
      <OakMaxWidth
        $mt={["space-between-xxxl"]}
        $maxWidth="all-spacing-23"
        $background="lavender30"
        $justifyContent={"space-between"}
      >
        <OakGrid
          $height={"100%"}
          $cg={["space-between-none", "space-between-m", "space-between-l"]}
          $rg={["space-between-l", "space-between-none", "space-between-none"]}
          $mh="auto"
          $mt={["space-between-xxxl"]}
          $ph={["inner-padding-s", "inner-padding-s", "inner-padding-none"]}

          // $mh={["space-between-m", "space-between-s", "space-between-none"]} // Adjusted for responsiveness
        >
          <OakGridArea $alignContent={"center"} $colSpan={[12, 6, 7]}>
            <OakBox
              $background="white"
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
                <OakPrimaryButton
                  element={Link}
                  href="/aila"
                  iconName="arrow-right"
                  isTrailingIcon={true}
                  $mt="space-between-l"
                >
                  Create a lesson
                </OakPrimaryButton>
              </OakFlex>
            </OakBox>
          </OakGridArea>
          <OakGridArea $colSpan={[12, 6, 5]}>
            <OakBox
              $background="white"
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
                <OakPrimaryButton
                  element={Link}
                  href="/aila/tools/teaching-materials"
                  iconName="arrow-right"
                  isTrailingIcon={true}
                  $mt="space-between-m"
                  onClick={() => {
                    track.createTeachingMaterialsInitiated({
                      platform: "aila-beta",
                      product: "ai lesson assistant",
                      engagementIntent: "use",
                      componentType: "create_additional_materials_button",
                      eventVersion: "2.0.0",
                      analyticsUseCase: "Teacher",
                      isLoggedIn: Boolean(user),
                    });
                  }}
                >
                  Create teaching materials
                </OakPrimaryButton>
              </OakFlex>
            </OakBox>
          </OakGridArea>
        </OakGrid>
        <OakFlex
          $ph={["inner-padding-s", "inner-padding-s", "inner-padding-none"]}
          // $alignItems={"flex-end"}
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
