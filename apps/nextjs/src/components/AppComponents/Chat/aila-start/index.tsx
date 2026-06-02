"use client";

import type { TeachingMaterialType } from "@oakai/teaching-materials/src/documents/teachingMaterials/configSchema";

import { useUser } from "@clerk/nextjs";
import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakMaxWidth,
  OakP,
  OakPrimaryButton,
  OakTertiaryButton,
  OakUL,
} from "@oaknational/oak-components";
import Link from "next/link";
import styled from "styled-components";

import useAnalytics from "@/lib/analytics/useAnalytics";
import { getAilaUrl } from "@/utils/getAilaUrl";

import ChatPanelDisclaimer from "../chat-panel-disclaimer";
import EmptyScreenAccordion from "../empty-screen-accordion";

const teachingMaterialsList: {
  label: string;
  docType: TeachingMaterialType;
}[] = [
  { label: "Glossaries", docType: "additional-glossary" },
  {
    label: "Comprehension tasks",
    docType: "additional-comprehension",
  },
  { label: "Starter quiz", docType: "additional-starter-quiz" },
  { label: "Exit quiz", docType: "additional-exit-quiz" },
];

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
        $mt={["spacing-80"]}
        $maxWidth="spacing-960"
        $background="bg-decorative3-very-subdued"
        $justifyContent={"space-between"}
      >
        <OakGrid
          $height={"100%"}
          $cg={["spacing-0", "spacing-24", "spacing-48"]}
          $rg={["spacing-48", "spacing-0", "spacing-0"]}
          $mh="auto"
          $mt={["spacing-80"]}
          $ph={["spacing-12", "spacing-12", "spacing-0"]}
        >
          <OakGridArea $alignContent={"center"} $colSpan={[12, 6, 7]}>
            <OakBox
              $background="bg-primary"
              $pa="spacing-24"
              $borderRadius="border-radius-s"
              $position={"relative"}
            >
              <OakFlex $flexDirection="column">
                {/* Heading and description */}
                <OakHeading $mb="spacing-16" $font="heading-5" tag="h2">
                  Create a lesson with AI
                </OakHeading>
                <OakP $mb="spacing-16" $font="body-2">
                  Aila will guide you step-by-step to create and download a
                  tailor-made lesson, including:
                </OakP>

                <EmptyScreenAccordion />
                <OakBox $mt="spacing-48">
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
          <OakGridArea $colSpan={[12, 6, 4]}>
            <OakBox
              $background="bg-primary"
              $pa="spacing-24"
              $borderRadius="border-radius-s"
            >
              <OakFlex $gap="spacing-24" $flexDirection="column">
                <OakHeading $font="heading-5" tag="h2">
                  Create teaching materials
                </OakHeading>
                <OakP $font="body-2">
                  Enhance your own lessons with editable resources:
                </OakP>
                <OakBox
                  $color={"border-neutral"}
                  $bb={"border-solid-s"}
                  $pa="spacing-0"
                />

                <OakFlex $flexDirection={"column"} $gap="spacing-12">
                  {teachingMaterialsList.map((item) => (
                    <OakTertiaryButton
                      key={item.docType}
                      data-testid={`create-teaching-materials-button-${item.docType}`}
                      element="a"
                      href={`${getAilaUrl("teaching-materials")}?docType=${item.docType}`}
                      iconName="chevron-right"
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
                      {item.label}
                    </OakTertiaryButton>
                  ))}
                </OakFlex>
              </OakFlex>
            </OakBox>
          </OakGridArea>
        </OakGrid>
        <OakFlex
          $ph={["spacing-12", "spacing-12", "spacing-0"]}
          $justifyContent={"center"}
        >
          <OakBox $mb={"spacing-24"} $mt="spacing-48">
            <ChatPanelDisclaimer size="sm" />
          </OakBox>
        </OakFlex>
      </OakMaxWidth>
    </OakFlex>
  );
}
