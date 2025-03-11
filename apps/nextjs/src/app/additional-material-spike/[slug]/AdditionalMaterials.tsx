"use client";

import type { FC } from "react";
import React, { useEffect, useState } from "react";

import type {
  AilaPersistedChat,
  LessonPlanKey,
} from "@oakai/aila/src/protocol/schema";
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

import { LessonPlanSectionContent } from "@/components/AppComponents/Chat/drop-down-section/lesson-plan-section-content";
import Layout from "@/components/Layout";

import { getPrompt } from "../../../../../../packages/additional-materials/src/fetchAdditionalMaterials";
import {
  isComprehensionMaterial,
  isHomeworkMaterial,
  type ComprehensionTaskType,
  type HomeworkMaterialType,
  type SchemaMapType,
} from "../../../../../../packages/additional-materials/src/schemas";
import { ComprehensionTask } from "./ComprehensionTask";
import { Homework } from "./Homework";

export function mapLessonPlanSections(pageData: AilaPersistedChat) {
  if (!pageData.lessonPlan) {
    return [];
  }

  const lessonPlan = pageData.lessonPlan;
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
  const [generation, setGeneration] = useState<
    HomeworkMaterialType | ComprehensionTaskType | null
  >(null);
  const [action, setAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState<{
    prompt: string;
    systemMessage: string;
  } | null>(null);

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

  const handleSubmit = async (message?: string) => {
    if (!action) {
      alert("No action selected");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/additional-materials", {
        method: "POST",
        body: JSON.stringify({
          lessonPlan: pageData.lessonPlan,
          action: action,
          message: message ?? undefined,
          previousOutput: generation,
        }),
      });
      const { data } = await res.json();

      setGeneration(data);
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
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
          Choose another lesson
        </OakPrimaryInvertedButton>
      </OakBox>

      <OakFlex $gap={"space-between-m"} $flexDirection="column">
        <OakHeading tag="h1">
          {`LESSON: ${pageData.lessonPlan.title} - ${pageData.lessonPlan.subject} - ${pageData.lessonPlan.keyStage}`}
        </OakHeading>
        <OakAccordion id={"lesson-plan"} header="Lesson plan">
          <OakFlex $flexDirection="column">
            {mapLessonPlanSections(
              pageData as unknown as AilaPersistedChat,
            ).map((section) => {
              return (
                <>
                  <OakFlex $flexDirection={"column"}>
                    <OakHeading $font={"heading-5"} tag="h2">
                      {section.key}
                    </OakHeading>
                    <OakFlex>
                      <LessonPlanSectionContent
                        sectionKey={section.key as LessonPlanKey}
                        value={section.data as string}
                      />
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
            <OakAccordion id={"sprompt"} header="System message">
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
              onChange={(value) =>
                setAction(value.target.value as SchemaMapType)
              }
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

          {isLoading && <OakP>Loading...</OakP>}
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
        </OakFlex>
      </OakFlex>
    </Layout>
  );
};

export default AdditionalMaterials;
