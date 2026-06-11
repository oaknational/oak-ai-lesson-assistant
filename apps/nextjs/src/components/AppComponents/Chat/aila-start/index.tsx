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
} from "@oaknational/oak-components";
import Link from "next/link";

import useAnalytics from "@/lib/analytics/useAnalytics";
import { getAilaUrl } from "@/utils/getAilaUrl";

import { AilaFaqSection } from "../aila-faq-section";
import { AILA_FEEDBACK_FORM_URL, BetaTagWithFeedback } from "../beta-tag";
import ChatPanelDisclaimer from "../chat-panel-disclaimer";

const teachingMaterialsList: {
  label: string;
  ariaLabel: string;
  docType: TeachingMaterialType;
}[] = [
  {
    label: "Glossary",
    ariaLabel: "Create a glossary teaching material",
    docType: "additional-glossary",
  },
  {
    label: "Comprehension task",
    ariaLabel: "Create a comprehension task teaching material",
    docType: "additional-comprehension",
  },
  {
    label: "Starter quiz",
    ariaLabel: "Create a starter quiz teaching material",
    docType: "additional-starter-quiz",
  },
  {
    label: "Exit quiz",
    ariaLabel: "Create an exit quiz teaching material",
    docType: "additional-exit-quiz",
  },
];

export function AilaStart() {
  const { track } = useAnalytics();
  const { user } = useUser();

  return (
    <OakFlex
      $background="bg-decorative3-very-subdued"
      $flexDirection="column"
      $alignItems="center"
      $minHeight={["100%", "100vh", "100vh"]}
      $pt={["spacing-72"]}
    >
      <OakMaxWidth
        $mt={["spacing-48"]}
        $maxWidth="spacing-960"
        $background="bg-decorative3-very-subdued"
        $justifyContent={"space-between"}
      >
        <OakGrid
          $height={"100%"}
          $cg={["spacing-32", "spacing-20", "spacing-20"]}
          $rg={["spacing-32", "spacing-0", "spacing-0"]}
          $mh="auto"
          $ph={["spacing-12", "spacing-12", "spacing-0"]}
        >
          <OakGridArea $alignContent={"center"} $colSpan={[12, 12, 12]}>
            <OakBox>
              <BetaTagWithFeedback feedbackHref={AILA_FEEDBACK_FORM_URL} />
            </OakBox>
            <OakFlex
              $flexDirection="column"
              $mv={["spacing-48", "spacing-48", "spacing-48"]}
            >
              <OakFlex $flexDirection="column" $gap="spacing-8">
                <OakHeading tag="h1" $font="heading-4">
                  Aila, Oak's AI lesson assistant
                </OakHeading>
                <OakP $font="body-1">
                  Helping teachers create and tailor lessons and resources
                </OakP>
              </OakFlex>
            </OakFlex>
          </OakGridArea>
          <OakGridArea $alignContent={"center"} $colSpan={[12, 6, 7]}>
            <OakBox
              $background="bg-primary"
              $pa="spacing-32"
              $borderRadius="border-radius-s"
              $position={"relative"}
            >
              <OakFlex $flexDirection="column" $gap="spacing-24">
                <OakHeading $font="heading-5" tag="h2">
                  Create a lesson
                </OakHeading>
                <OakP $font="body-2">
                  Work step by step with Aila to create, tailor and download
                  formatted lesson resources you can build on.
                </OakP>
                <OakPrimaryButton
                  element={Link}
                  href={getAilaUrl("lesson")}
                  iconName="arrow-right"
                  isTrailingIcon={true}
                >
                  Create a lesson
                </OakPrimaryButton>
                <AilaFaqSection />
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
                      aria-label={item.ariaLabel}
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
          <OakBox $mb={"spacing-16"} $mt="spacing-48">
            <ChatPanelDisclaimer />
          </OakBox>
        </OakFlex>
      </OakMaxWidth>
    </OakFlex>
  );
}
