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
import { getKeystageFromYearGroup } from "@oakai/additional-materials/src/documents/additionalMaterials/promptHelpers";
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
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [resourceId, setResourceId] = useState<string | null>(null);
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
  const [docType, setDocType] = useState<string | null>(null);
  const [lessonFields, setLessonField] = useState<
    PartialLessonPlanFieldKeys[] | []
  >(["title", "keyStage", "subject"]);
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
  const [year, setYear] = useState<string | null>(null);

  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();
  const generateLessonPlan =
    trpc.additionalMaterials.generatePartialLessonPlanObject.useMutation();

  useEffect(() => {
    if (docType) {
      const prompt = additionalMaterialsConfigMap[
        docType as AdditionalMaterialType
      ].buildPrompt(
        {
          lessonPlan: pageData.lessonPlan,
        },
        "generate",
      );
      const systemMessage =
        additionalMaterialsConfigMap[
          docType as AdditionalMaterialType
        ].systemMessage();

      setAmPrompt({
        prompt,
        systemMessage,
      });
    }
  }, [docType, pageData.lessonPlan]);

  useEffect(() => {
    if (docType) {
      const systemMessage = buildPartialLessonSystemMessage({
        keyStage: year ? getKeystageFromYearGroup(year) : "",
        subject: subject ?? "",
        title: title ?? "",
        year: year ?? "7",
      });
      const prompt = buildPartialLessonPrompt({
        lessonParts: lessonFields,
      });
      setPrompt({
        prompt,
        systemMessage,
      });
    }
  }, [
    docType,
    keyStage,
    lessonFields,
    pageData.lessonPlan,
    subject,
    title,
    year,
  ]);

  const handleSubmitLessonPlan = async () => {
    const res = await generateLessonPlan.mutateAsync({
      title: title ?? "",
      subject: subject ?? "",
      keyStage: keyStage ?? "",
      year: year ?? "",
      lessonParts: ["title", ...lessonFields],
    });

    if (res.threatDetection || res.lesson === null) {
      return;
    }

    setPageData({ lessonPlan: res.lesson });
    setLessonId(res.lessonId);
  };

  const handleSubmit = async (message?: string) => {
    setGeneration(null);
    if (!docType) {
      alert("No docType selected");
      return;
    }

    try {
      const res = await fetchMaterial.mutateAsync({
        documentType: docType,
        action: message ? "refine" : "generate",
        lessonId: lessonId,
        resourceId: resourceId ?? null,
        context: {
          lessonPlan: pageData.lessonPlan,
          message: message ?? null,
          previousOutput: generation ?? null,
          options: null,
        },
      });

      setGeneration(res.resource);
      setModeration(res.moderation.justification ?? null);
      setResourceId(res.resourceId ?? null);
    } catch (error) {
      log.error("error", error);
      Sentry.captureException(error);
    }
  };
  const renderGeneratedMaterial = () => {
    const handleRefine = async (refinement: string) => {
      setGeneration(null);
      if (!docType) {
        alert("No docType selected");
        return;
      }

      try {
        const res = await fetchMaterial.mutateAsync({
          documentType: docType,
          action: "refine",
          lessonId: lessonId,
          resourceId: resourceId ?? null,
          context: {
            lessonPlan: pageData.lessonPlan,
            previousOutput: generation ?? null,
            options: null,
            refinement: [{ type: refinement }],
          },
        });

        setGeneration(res.resource);
        setModeration(res.moderation.justification ?? null);
        setResourceId(res.resourceId ?? null);
      } catch (error) {
        log.error("error", error);
        Sentry.captureException(error);
      }
    };
    if (!generation) {
      return null;
    }
    if (docType === "additional-glossary" && isGlossary(generation)) {
      return (
        <Glossary
          handleSubmit={(refinement) => {
            void handleRefine(refinement);
          }}
          action={docType}
          generation={generation}
        />
      );
    }
    if (
      docType === "additional-comprehension" &&
      isComprehensionTask(generation)
    ) {
      return <ComprehensionTask action={docType} generation={generation} />;
    }

    return null;
  };

  return (
    <Layout>
      <p>{lessonFields}</p>

      <OakTextInput
        onChange={(value) => setYear(value.target.value)}
        placeholder="year (1-11)"
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
          defaultChecked={
            field === "title" || field === "keyStage" || field === "subject"
          }
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
                setDocType(value.target.value);
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
