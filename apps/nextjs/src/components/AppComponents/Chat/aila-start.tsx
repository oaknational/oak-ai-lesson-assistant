"use client";

import { useUser } from "@clerk/nextjs";
import {
  OakFlex,
  OakLI,
  OakP,
  OakPrimaryButton,
  OakUL,
} from "@oaknational/oak-components";
import { Flex } from "@radix-ui/themes";
import Link from "next/link";
import styled from "styled-components";

import useAnalytics from "@/lib/analytics/useAnalytics";

import ChatPanelDisclaimer from "./chat-panel-disclaimer";
import EmptyScreenAccordion from "./empty-screen-accordion";

export const exampleMessages = [
  {
    heading: "History • Key stage 3 • The end of Roman Britain ",
    message:
      "Create a lesson plan about the end of Roman Britain for key stage 3 history",
  },
];

// default styling is being overridden here by tailwind, we can remove this when re removing tailwind
const StyledUL = styled(OakUL)`
  list-style-type: disc;
  margin-top: 1em;
  margin-bottom: 1em;
  /* margin-left: 40px; */
  padding-left: 20px;
`;

export function AilaStart() {
  const { track } = useAnalytics();
  const { user } = useUser();

  return (
    <Flex
      direction="column"
      justify="center"
      className="min-h-screen bg-lavender30 pt-26"
    >
      <OakFlexWithHeight
        $flexDirection="column"
        $justifyContent="space-between"
        $maxWidth="all-spacing-23"
        $mh="auto"
        $gap="space-between-l"
        $ph={["inner-padding-l", "inner-padding-none"]}
      >
        <OakFlex $flexDirection={["column", "row"]} $gap="space-between-l">
          <OakFlex
            $background={"bg-primary"}
            $flexDirection="column"
            $gap="all-spacing-2"
            $pa="inner-padding-xl2"
          >
            <OakFlex $flexDirection="column" $gap="all-spacing-2">
              <OakP $font="heading-5">Create a lesson with AI</OakP>
              <OakP $font="body-2">
                Aila will guide you step-by-step to create and download a
                tailor-made lesson, including:
              </OakP>
            </OakFlex>
            <EmptyScreenAccordion />
            <OakPrimaryButton
              element={Link}
              href="/aila"
              iconName="arrow-right"
              isTrailingIcon={true}
            >
              Create a lesson
            </OakPrimaryButton>
          </OakFlex>
          <Card>
            <OakFlex $flexDirection="column" $gap="all-spacing-2">
              <OakP $font="heading-5">Create teaching materials with AI</OakP>
              <OakP>
                Enhance lessons with a range of teaching materials, including:
              </OakP>
              <StyledUL>
                <OakLI $mv={"space-between-xs"}>Glossaries</OakLI>
                <OakLI $mv={"space-between-xs"}>Comprehension tasks</OakLI>
                <OakLI $mt={"space-between-xs"}>Quizzes</OakLI>
              </StyledUL>
            </OakFlex>
            <OakPrimaryButton
              element={Link}
              href="/aila/tools/teaching-materials"
              iconName="arrow-right"
              isTrailingIcon={true}
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
          </Card>
        </OakFlex>
        <OakFlex $mt="space-between-l">
          <ChatPanelDisclaimer size="sm" />
        </OakFlex>
      </OakFlexWithHeight>
    </Flex>
  );
}

const OakFlexWithHeight = styled(OakFlex)`
  height: 80%;
`;

const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <OakFlex50
      $flexDirection="column"
      $gap="all-spacing-6"
      $background="white"
      $borderRadius="border-radius-s"
      $pa="inner-padding-xl2"
    >
      {children}
    </OakFlex50>
  );
};

const OakFlex50 = styled(OakFlex)`
  width: 50%;
  height: fit-content;
  @media (max-width: 768px) {
    width: 100%;
  }
`;
