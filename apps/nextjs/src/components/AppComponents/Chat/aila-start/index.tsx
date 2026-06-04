"use client";

import type { TeachingMaterialType } from "@oakai/teaching-materials/src/documents/teachingMaterials/configSchema";

import { useUser } from "@clerk/nextjs";
import {
  OakAccordion,
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakLink,
  OakMaxWidth,
  OakP,
  OakPrimaryButton,
  OakSpan,
  OakTertiaryButton,
} from "@oaknational/oak-components";
import type { OakAccordionProps } from "@oaknational/oak-components";
import Link from "next/link";

import useAnalytics from "@/lib/analytics/useAnalytics";
import { getAilaUrl } from "@/utils/getAilaUrl";

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
    ariaLabel: "Create a comprehension tasks teaching material",
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

type AilaFaqAccordionProps = Pick<
  OakAccordionProps,
  "id" | "header" | "$bt" | "$bb"
> & {
  readonly children: React.ReactNode;
};

function AilaFaqAccordion({
  id,
  header,
  $bt,
  $bb,
  children,
}: AilaFaqAccordionProps) {
  return (
    <OakAccordion
      id={id}
      header={header}
      $color="text-link-active"
      $ba="border-solid-none"
      $bt={$bt}
      $bb={$bb}
      $borderColor="border-neutral"
      openBackground="bg-primary"
      chevronPosition="right"
      $pa="spacing-0"
      $pv="spacing-12"
    >
      <OakFlex $mt="spacing-16" $flexDirection="column" $gap="spacing-12">
        {children}
      </OakFlex>
    </OakAccordion>
  );
}

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
          $cg={["spacing-0", "spacing-20", "spacing-20"]}
          $rg={["spacing-48", "spacing-0", "spacing-0"]}
          $mh="auto"
          $ph={["spacing-12", "spacing-12", "spacing-0"]}
        >
          <OakGridArea $alignContent={"center"} $colSpan={[12, 12, 12]}>
            <OakFlex
              $flexDirection="column"
              $mv={["spacing-48", "spacing-80", "spacing-48"]}
              $ph={["spacing-12", "spacing-12", "spacing-0"]}
            >
              <OakFlex $alignItems="center" $gap="spacing-12"></OakFlex>
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
              $pa="spacing-24"
              $borderRadius="border-radius-s"
              $position={"relative"}
            >
              <OakFlex $flexDirection="column" $gap="spacing-24">
                <OakHeading $font="heading-5" tag="h2">
                  Create a lesson
                </OakHeading>
                <OakP $font="body-2">
                  Work <OakSpan $font="body-2-bold">step by step</OakSpan> with
                  Aila to create, tailor and download formatted lesson resources
                  you can <OakSpan $font="body-2-bold">build on</OakSpan>.
                </OakP>
                <OakPrimaryButton
                  element={Link}
                  href={getAilaUrl("lesson")}
                  iconName="arrow-right"
                  isTrailingIcon={true}
                >
                  Create a lesson
                </OakPrimaryButton>
                <OakBox>
                  <AilaFaqAccordion
                    id="create-lesson-whats-included"
                    header={
                      <OakSpan $textAlign="left" $font="body-2-bold">
                        What's included?
                      </OakSpan>
                    }
                    $bt="border-solid-s"
                    $bb="border-solid-s"
                  >
                    <OakP $font="body-2">
                      Once you've co-created your lesson with Aila, you can
                      download and tailor a lesson plan, slide deck, worksheet,
                      prior knowledge starter quiz and assessment exit quiz.
                    </OakP>
                    <OakP $font="body-2">
                      Everything is grounded in Oak's{" "}
                      <OakLink
                        href="https://www.thenational.academy/teachers/curriculum"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        curriculum expertise
                      </OakLink>{" "}
                      and national curriculum-aligned resources across key
                      stages 1–4.
                    </OakP>
                    <OakP $font="body-2">
                      Your slide deck is easy to make your own. Add your images,
                      examples and classroom context, or apply your school's
                      template once downloaded.
                    </OakP>
                    <OakP $font="body-2">
                      Aila currently helps you create individual lessons, not
                      full sequences. It also doesn't generate images or web
                      links; we'd rather you choose your own.
                    </OakP>
                  </AilaFaqAccordion>
                  <AilaFaqAccordion
                    id="create-lesson-aila-different"
                    header={
                      <OakSpan $textAlign="left" $font="body-2-bold">
                        How's Aila different from other AI tools?
                      </OakSpan>
                    }
                    $bb="border-solid-s"
                  >
                    <OakP $font="body-2">
                      With a general AI tool, you start from a blank chat box
                      and figure it out yourself. Aila gives you a structured,
                      teacher-led process instead, grounded in{" "}
                      <OakLink
                        href="https://www.thenational.academy/teachers/curriculum"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        our curriculum expertise
                      </OakLink>{" "}
                      and national curriculum-aligned{" "}
                      <OakLink
                        href="https://www.thenational.academy/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        resources across key stages 1–4
                      </OakLink>
                      , all ready to tailor to your class and context.
                    </OakP>
                    <OakP $font="body-2">
                      Aila draws on Oak's lessons and resources, so you're
                      building on a strong foundation rather than starting from
                      scratch.
                    </OakP>
                  </AilaFaqAccordion>
                  <AilaFaqAccordion
                    id="create-lesson-why-trust"
                    header={
                      <OakSpan $textAlign="left" $font="body-2-bold">
                        Why trust Aila?
                      </OakSpan>
                    }
                  >
                    <OakP $font="body-2">
                      Thousands of teachers are using Aila to save up to three
                      hours a week on lesson planning.
                    </OakP>
                    <OakP $font="body-2">
                      Aila is built specifically for the classroom. It was made
                      with teachers and curriculum specialists and is grounded
                      in Oak's curriculum-aligned resources.
                    </OakP>
                    <OakP $font="body-2">
                      You stay in control throughout, working step by step to
                      create your lesson. Content is moderated to be{" "}
                      <OakLink
                        href="https://www.thenational.academy/blog/building-ai-that-s-safe-for-the-classroom-what-we-have-learned-with-aila"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        safe and appropriate
                      </OakLink>{" "}
                      for your pupils, and Aila{" "}
                      <OakLink
                        href="https://www.thenational.academy/blog/choosing-ai-for-your-school-how-our-ai-tools-exceed-the-dfe-latest-safety-standards"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        meets and exceeds the DfE's AI safety standards
                      </OakLink>
                      .
                    </OakP>
                    <OakP $font="body-2">
                      AI can make mistakes, so like with any teaching resource,
                      it's worth reviewing materials before use. You know your
                      pupils best.
                    </OakP>
                  </AilaFaqAccordion>
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
