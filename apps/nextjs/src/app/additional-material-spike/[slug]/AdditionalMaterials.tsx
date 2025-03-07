"use client";

import type { FC } from "react";
import React, { useCallback, useState } from "react";

import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import {
  OakFlex,
  OakHeading,
  OakIcon,
  OakMaxWidth,
  OakP,
  OakPrimaryButton,
  OakRadioButton,
  OakRadioGroup,
} from "@oaknational/oak-components";
import { Flex } from "@radix-ui/themes";
import { SemanticClassificationFormat } from "typescript";

import { notEmpty } from "@/components/AppComponents/Chat/chat-lessonPlanDisplay";
import { LessonPlanSectionContent } from "@/components/AppComponents/Chat/drop-down-section/lesson-plan-section-content";
import { LessonPlanSection } from "@/components/AppComponents/Chat/lesson-plan-section";
import Layout from "@/components/Layout";
import { slugToSentenceCase } from "@/utils/toSentenceCase";

import {
  isComprehensionMaterial,
  isHomeworkMaterial,
  type ComprehensionTaskType,
  type HomeworkMaterialType,
  type SchemaMapType,
} from "../../../../../../packages/additional-materials/src/schemas";
import { ComprehensionTask } from "./ComprehensionTask";
import { Homework } from "./Homework";

export const allSectionsInOrder = [
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
  "scienceAdditionalMaterials",
  "additionalMaterials",
] as const;

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
    "scienceAdditionalMaterials",
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
  };
}

const AdditionalMaterials: FC<AdditionalMaterialsProps> = ({ pageData }) => {
  const [generation, setGeneration] = useState<
    HomeworkMaterialType | ComprehensionTaskType | null
  >(null);
  const [action, setAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action) {
      console.log("No action selected");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/additional-materials", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Messages during finals week.",
          lessonPlan: pageData.lessonPlan,
          action: action,
        }),
      });

      console.log(res);

      const { data } = await res.json();
      console.log("data", data);
      //   const parsedData = schemaMap[action].parse(data);
      //   console.log("parsedData", parsedData);

      setGeneration(data);
      setIsLoading(false);
    } catch (error) {
      console.error("error", error);
    }
  };

  console.log("pageData", mapLessonPlanSections(pageData));

  return (
    <Layout>
      <OakFlex $flexDirection="column">
        <OakHeading tag="h1">
          {`${pageData.lessonPlan.title} - ${pageData.lessonPlan.subject} - ${pageData.lessonPlan.keyStage}`}
        </OakHeading>

        {mapLessonPlanSections(pageData).map((section) => {
          return (
            <>
              <OakFlex $flexDirection={"column"}>
                <OakHeading $font={"heading-4"} tag="h2">
                  {section.key}
                </OakHeading>
                <OakFlex $pv={"space-between-m"}>
                  <LessonPlanSectionContent
                    sectionKey={section.key}
                    value={section.data}
                  />
                </OakFlex>
              </OakFlex>
            </>
          );
        })}
        <OakFlex $ma="space-between-m">
          <OakRadioGroup
            name="radio-group"
            onChange={(value) => setAction(value.target.value as SchemaMapType)}
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
        <OakPrimaryButton $ma="space-between-m" onClick={handleSubmit}>
          Submit
        </OakPrimaryButton>
        {isLoading && <OakP>Loading...</OakP>}

        <OakFlex $mt={"space-between-m"}>
          {!isLoading &&
            action === "additional-homework" &&
            isHomeworkMaterial(generation) && (
              <Homework action={action} generation={generation} />
            )}
          {!isLoading &&
            action === "additional-comprehension" &&
            isComprehensionMaterial(generation) && (
              <ComprehensionTask action={action} generation={generation} />
            )}
        </OakFlex>
      </OakFlex>
    </Layout>
  );
};

export default AdditionalMaterials;
