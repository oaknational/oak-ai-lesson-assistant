"use client";

import type { FC } from "react";
import React, { useEffect, useState } from "react";

import { getPrompt } from "@oakai/additional-materials/src/helpers";
import {
  type AdditionalMaterialType,
  type SchemaMapType,
  isComprehensionMaterial,
  isHomeworkMaterial,
} from "@oakai/additional-materials/src/schemas";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { aiLogger } from "@oakai/logger";

import {
  OakAccordion,
  OakBox,
  OakFlex,
  OakHeading,
  OakP,
  OakPrimaryButton,
  OakPrimaryInvertedButton,
  OakRadioButton,
  OakRadioGroup,
} from "@oaknational/oak-components";
import { redirect } from "next/navigation";

import { ComprehensionTask } from "@/components/AppComponents/AdditionalMaterials/ComprehensionTask";
import { Homework } from "@/components/AppComponents/AdditionalMaterials/Homework";
import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";
import { useClientSideFeatureFlag } from "@/components/ContextProviders/FeatureFlagProvider";
import Layout from "@/components/Layout";
import { trpc } from "@/utils/trpc";

const log = aiLogger("additional-materials");

export function mapLessonPlanSections(
  lessonPlan: AilaPersistedChat["lessonPlan"],
) {
  if (!lessonPlan) {
    return [];
  }

  const sectionKeys = [
    "title",
    "keyStage",
    "subject",
    "topic",
    "learningOutcome",
    "learningCycles",
    "priorKnowledge",
    "keyLearningPoints",
    "misconceptions",
    "keywords",
    "starterQuiz",
    "cycle1",
    "cycle2",
    "cycle3",
    "exitQuiz",
    "additionalMaterials",
  ];

  return sectionKeys.map((key) => ({
    key,
    data: lessonPlan[key as keyof typeof lessonPlan] ?? null,
  }));
}

export type Cycle = {
  title: string;
  durationInMinutes: number;
  explanation: {
    imagePrompt: string;
    spokenExplanation: string[];
    accompanyingSlideDetails: string;
    slideText: string;
  };
  practice: string;
  feedback: string;
} | null;

interface AdditionalMaterialsProps {
  pageData: {
    lessonPlan: AilaPersistedChat["lessonPlan"];
    transcript?: string | null;
  };
}

const AdditionalMaterials: FC<AdditionalMaterialsProps> = ({ pageData }) => {
  const [generation, setGeneration] = useState<AdditionalMaterialType | null>(
    null,
  );
  const [moderation, setModeration] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const fetchMaterialModeration =
    trpc.additionalMaterials.getAdditionalMaterialModeration.useMutation();
  const fetchMaterial =
    trpc.additionalMaterials.getAdditionalMaterial.useMutation();
  const [prompt, setPrompt] = useState<{
    prompt: string;
    systemMessage: string;
  } | null>(null);

  const canSeeSpike = useClientSideFeatureFlag("additional-materials");

  if (!canSeeSpike) {
    redirect("/");
  }

  useEffect(() => {
    if (action) {
      const prompt = getPrompt(pageData.lessonPlan, action);
      setPrompt(
        prompt as {
          prompt: string;
          systemMessage: string;
        },
      );
    }
  }, [action, pageData.lessonPlan]);

  useEffect(() => {
    if (
      generation !== null &&
      !fetchMaterialModeration.isLoading &&
      !moderation
    ) {
      const fetchData = async () => {
        try {
          const data = await fetchMaterialModeration.mutateAsync({
            generation: JSON.stringify(generation),
          });

          setModeration(data);
        } catch (error) {
          log.error("error", error);
        }
      };
      void fetchData();
    }
  }, [fetchMaterialModeration, generation, moderation]);

  const handleSubmit = async (message?: string) => {
    setGeneration(null);
    if (!action) {
      alert("No action selected");
      return;
    }

    try {
      const res = await fetchMaterial.mutateAsync({
        lessonPlan: pageData.lessonPlan,
        action: action,
        message: message ?? undefined,
        previousOutput: generation,
      });

      setGeneration(res);
    } catch (error) {
      log.error("error", error);
    }
  };
  const renderGeneratedMaterial = () => {
    if (!generation) return null;

    if (action === "additional-homework" && isHomeworkMaterial(generation)) {
      return <Homework action={action} generation={generation} />;
    }

    if (
      action === "additional-comprehension" &&
      isComprehensionMaterial(generation)
    ) {
      return <ComprehensionTask action={action} generation={generation} />;
    }

    return null;
  };

  return (
    <Layout>
      <OakBox $mb={"space-between-m"}>
        <OakPrimaryInvertedButton
          element="a"
          href="/additional-material-spike/"
        >
          * Choose another lesson *
        </OakPrimaryInvertedButton>
      </OakBox>

      <OakFlex $gap={"space-between-m"} $flexDirection="column">
        <OakHeading tag="h1">
          {`LESSON: ${pageData.lessonPlan.title} - ${pageData.lessonPlan.subject} - ${pageData.lessonPlan.keyStage}`}
        </OakHeading>
        <OakAccordion id={"lesson-plan"} header="Lesson plan">
          <OakFlex $flexDirection="column">
            {mapLessonPlanSections(pageData.lessonPlan).map((section) => {
              return (
                <>
                  <OakFlex $flexDirection={"column"}>
                    <OakHeading $font={"heading-5"} tag="h2">
                      {section.key}
                    </OakHeading>
                    <OakFlex $pv="inner-padding-m">
                      <OakFlex $flexDirection="column">
                        <MemoizedReactMarkdownWithStyles
                          markdown={`${sectionToMarkdown(section.key, section.data)}`}
                        />
                      </OakFlex>
                    </OakFlex>
                  </OakFlex>
                </>
              );
            })}
          </OakFlex>
        </OakAccordion>
        {pageData.transcript && (
          <OakAccordion id={"transcript"} header="Transcript">
            <OakFlex>
              <OakP>{pageData.transcript}</OakP>
            </OakFlex>
          </OakAccordion>
        )}
        {prompt && (
          <>
            <OakAccordion id={"prompt"} header="Prompt">
              <p
                dangerouslySetInnerHTML={{
                  __html: prompt.prompt.replace(/\n/g, "<br />"),
                }}
              />
            </OakAccordion>
            <OakAccordion id={"system-prompt"} header="System message">
              <p
                dangerouslySetInnerHTML={{
                  __html: prompt.systemMessage.replace(/\n/g, "<br />"),
                }}
              />
            </OakAccordion>
          </>
        )}

        <OakFlex $flexDirection={"column"} $background={"grey10"}>
          <OakHeading tag="h2">Select an material</OakHeading>
          <OakFlex $ma="space-between-m">
            <OakRadioGroup
              name="radio-group"
              onChange={(value) => {
                setAction(value.target.value as SchemaMapType);
                setModeration(null);
                setGeneration(null);
              }}
              $flexDirection="column"
            >
              <OakRadioButton
                id="radio-1"
                value="additional-homework"
                label="Homework"
              />
              <OakRadioButton
                id="radio-2"
                value="additional-comprehension"
                label="Comprehension"
              />
            </OakRadioGroup>
          </OakFlex>
          <OakPrimaryButton
            $mh="space-between-m"
            onClick={() => void handleSubmit()}
          >
            Submit
          </OakPrimaryButton>

          {fetchMaterial.isLoading && <OakP>Loading...</OakP>}
          <OakFlex $mt={"space-between-m"}>{renderGeneratedMaterial()}</OakFlex>
          {generation && (
            <OakFlex>
              <OakPrimaryButton
                onClick={() => void handleSubmit("Make it easier")}
              >
                {"Make it easier"}
              </OakPrimaryButton>
              <OakPrimaryButton
                onClick={() => void handleSubmit("Make it harder")}
              >
                {"Make it harder"}
              </OakPrimaryButton>
            </OakFlex>
          )}
          {fetchMaterialModeration.isLoading && (
            <OakP>Loading moderation...</OakP>
          )}
          <OakFlex
            $mt={"space-between-l"}
            $gap={"space-between-m"}
            $flexDirection="column"
          >
            {moderation && (
              <p
                dangerouslySetInnerHTML={{
                  __html: moderation.replace(/\n/g, "<br />"),
                }}
              />
            )}
          </OakFlex>
        </OakFlex>
      </OakFlex>
    </Layout>
  );
};

export default AdditionalMaterials;
