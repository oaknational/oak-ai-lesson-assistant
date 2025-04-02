"use client";

import type { FC } from "react";
import React, { useEffect, useState } from "react";

import { isComprehensionTask } from "@oakai/additional-materials/src/documents/additionalMaterials/comprehension/schema";
import {
  type AdditionalMaterialSchemas,
  type AdditionalMaterialType,
  additionalMaterialsConfigMap,
} from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { isGlossary } from "@oakai/additional-materials/src/documents/additionalMaterials/glossary/schema";
import {
  buildPartialLessonPrompt,
  buildPartialLessonSystemMessage,
} from "@oakai/additional-materials/src/documents/partialLessonPlan/buildPartialLessonPrompt";
import {
  type PartialLessonPlanFieldKeys,
  lessonFieldKeys,
} from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { sectionToMarkdown } from "@oakai/aila/src/protocol/sectionToMarkdown";
import { aiLogger } from "@oakai/logger";

import {
  OakAccordion,
  OakCheckBox,
  OakFlex,
  OakHeading,
  OakP,
  OakPrimaryButton,
  OakRadioButton,
  OakRadioGroup,
  OakTextInput,
} from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";

import { ComprehensionTask } from "@/components/AppComponents/AdditionalMaterials/ComprehensionTask";
import { Glossary } from "@/components/AppComponents/AdditionalMaterials/Glossary";
import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";
import Layout from "@/components/Layout";
import { trpc } from "@/utils/trpc";

const log = aiLogger("additional-materials");

export function mapLessonPlanSections(
  lessonPlan: AilaPersistedChat["lessonPlan"],
) {
  //   const sectionKeys = [
  //     "title",
  //     "keyStage",
  //     "subject",
  //     "topic",
  //     "learningOutcome",
  //     "learningCycles",
  //     "priorKnowledge",
  //     "keyLearningPoints",
  //     "misconceptions",
  //     "keywords",
  //     "starterQuiz",
  //     "cycle1",
  //     "cycle2",
  //     "cycle3",
  //     "exitQuiz",
  //     "additionalMaterials",
  //   ];

  return lessonFieldKeys.map((key) => ({
    key,
    data: lessonPlan[key] ?? null,
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

interface AdditionalMaterialsUserProps {
  pageData: { "" };
}

const AdditionalMaterialsUser: FC<AdditionalMaterialsUserProps> = () => {
  const [pageData, setPageData] = useState<
    AdditionalMaterialsProps["pageData"]
  >({
    lessonPlan: {
      title: "",
      keyStage: "",
      subject: "",
      topic: "",
      learningOutcome: "",
      learningCycles: [],
      priorKnowledge: [],
      keyLearningPoints: [],
      misconceptions: [],
      keywords: [],
      starterQuiz: [],
      cycle1: undefined,
      cycle2: undefined,
      cycle3: undefined,
      exitQuiz: undefined,
      additionalMaterials: undefined,
    },
  });
  const [generation, setGeneration] =
    useState<AdditionalMaterialSchemas | null>(null);
  const [moderation, setModeration] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [lessonFields, setLessonField] = useState<
    PartialLessonPlanFieldKeys[] | []
  >([]);
  const [prompt, setPrompt] = useState<{
    prompt: string;
    systemMessage: string;
  } | null>(null);
  const [amPrompt, setAmPrompt] = useState<{
    prompt: string;
    systemMessage: string;
  } | null>(null);
  const [keyStage, setKeyStage] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const fetchMaterialModeration =
    trpc.additionalMaterials.generateAdditionalMaterialModeration.useMutation();
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();
  const generateLessonPlan =
    trpc.additionalMaterials.generatePartialLessonPlanObject.useMutation();

  useEffect(() => {
    if (action) {
      const prompt = additionalMaterialsConfigMap[
        action as AdditionalMaterialType
      ].buildPrompt(
        {
          lessonPlan: pageData.lessonPlan,
        },
        "generate",
      );
      const systemMessage =
        additionalMaterialsConfigMap[
          action as AdditionalMaterialType
        ].systemMessage();

      setAmPrompt({
        prompt,
        systemMessage,
      });
    }
  }, [action, pageData.lessonPlan]);

  useEffect(() => {
    if (action) {
      const systemMessage = buildPartialLessonSystemMessage({
        lessonParts: lessonFields,
      });
      const prompt = buildPartialLessonPrompt({
        keyStage: keyStage ?? "",
        subject: subject ?? "",
        title: title ?? "",
      });
      setPrompt({
        prompt,
        systemMessage,
      });
    }
  }, [action, keyStage, lessonFields, pageData.lessonPlan, subject, title]);

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
          Sentry.captureException(error);
        }
      };
      void fetchData();
    }
  }, [fetchMaterialModeration, generation, moderation]);

  const handleSubmitLessonPlan = async () => {
    const res = await generateLessonPlan.mutateAsync({
      title: title ?? "",
      subject: subject ?? "",
      keyStage: keyStage ?? "",
      lessonParts: ["title", ...lessonFields],
    });
    setPageData({ lessonPlan: { ...res } });
    console.log("lessonPlan", res);
  };

  const handleSubmit = async (message?: string) => {
    setGeneration(null);
    if (!action) {
      alert("No action selected");
      return;
    }

    try {
      const res = await fetchMaterial.mutateAsync({
        documentType: action,
        action: message ? "refine" : "generate",
        context: {
          lessonPlan: pageData.lessonPlan,
          message: message ?? null,
          previousOutput: generation ?? null,
          options: null,
        },
      });

      setGeneration(res);
    } catch (error) {
      log.error("error", error);
      Sentry.captureException(error);
    }
  };
  const renderGeneratedMaterial = () => {
    if (!generation) {
      return null;
    }
    if (action === "additional-glossary" && isGlossary(generation)) {
      return <Glossary action={action} generation={generation} />;
    }
    if (
      action === "additional-comprehension" &&
      isComprehensionTask(generation)
    ) {
      return <ComprehensionTask action={action} generation={generation} />;
    }

    return null;
  };

  return (
    <Layout>
      <p>{lessonFields}</p>

      <OakTextInput
        onChange={(value) => setKeyStage(value.target.value)}
        placeholder="key stage"
      />
      <OakTextInput
        onChange={(value) => setSubject(value.target.value)}
        placeholder="subject"
      />
      <OakTextInput
        onChange={(value) => setTitle(value.target.value)}
        placeholder="title"
      />
      <OakPrimaryButton
        $mh="space-between-m"
        onClick={() => void handleSubmitLessonPlan()}
      >
        Submit
      </OakPrimaryButton>
      {prompt && (
        <>
          <OakAccordion id={"prompt"} header="Lesson Prompt">
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
      {generateLessonPlan.isLoading && <OakP>Building lesson plan...</OakP>}
      <p>Select lesson plan parts</p>
      {lessonFieldKeys.map((field) => (
        <OakCheckBox
          key={field}
          id={field}
          value={field}
          checked={field === "title"}
          onChange={(value) => {
            value.target.checked
              ? setLessonField((prev) => [...prev, field])
              : setLessonField((prev) =>
                  prev.filter((lessonField) => lessonField !== field),
                );
            console.log("lessonField", lessonFields);
          }}
        />
      ))}

      <OakFlex $gap={"space-between-m"} $flexDirection="column">
        <OakHeading tag="h1">
          {`LESSON: ${pageData.lessonPlan.title} - ${pageData.lessonPlan.subject} - ${pageData.lessonPlan.keyStage}`}
        </OakHeading>
        <OakAccordion id={"lesson-plan"} header="Lesson plan">
          <OakFlex $flexDirection="column">
            {mapLessonPlanSections(pageData.lessonPlan).map((section) => {
              return (
                <OakFlex key={section.key} $flexDirection={"column"}>
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
              );
            })}
          </OakFlex>
        </OakAccordion>
        {amPrompt && (
          <>
            <OakAccordion id={"prompt"} header="AM Prompt">
              <p
                dangerouslySetInnerHTML={{
                  __html: amPrompt.prompt.replace(/\n/g, "<br />"),
                }}
              />
            </OakAccordion>
            <OakAccordion id={"system-prompt"} header="System message">
              <p
                dangerouslySetInnerHTML={{
                  __html: amPrompt.systemMessage.replace(/\n/g, "<br />"),
                }}
              />
            </OakAccordion>
          </>
        )}
        {pageData.transcript && (
          <OakAccordion id={"transcript"} header="Transcript">
            <OakFlex>
              <OakP>{pageData.transcript}</OakP>
            </OakFlex>
          </OakAccordion>
        )}

        <OakFlex $flexDirection={"column"} $background={"grey10"}>
          <OakHeading tag="h2">Select an material</OakHeading>
          <OakFlex $ma="space-between-m">
            <OakRadioGroup
              name="radio-group"
              onChange={(value) => {
                setAction(value.target.value);
                setModeration(null);
                setGeneration(null);
              }}
              $flexDirection="column"
            >
              <OakRadioButton
                id="radio-1"
                value="additional-glossary"
                label="Glossary"
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

export default AdditionalMaterialsUser;
