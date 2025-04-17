"use client";

import type { FC } from "react";
import React, { useEffect, useMemo, useState } from "react";

import { isComprehensionTask } from "@oakai/additional-materials/src/documents/additionalMaterials/comprehension/schema";
import { type AdditionalMaterialSchemas } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { isGlossary } from "@oakai/additional-materials/src/documents/additionalMaterials/glossary/schema";
import { lessonFieldKeys } from "@oakai/additional-materials/src/documents/partialLessonPlan/schema";
import type { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";

import { ComprehensionTask } from "@/components/AppComponents/AdditionalMaterials/ComprehensionTask";
import { Glossary } from "@/components/AppComponents/AdditionalMaterials/Glossary";
import StepOne from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepOne";
import StepThree from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepThree";
import StepTwo from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepTwo";
import ResourcesLayout from "@/components/ResroucesLayout";
import { trpc } from "@/utils/trpc";

const log = aiLogger("additional-materials");

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

const ResourcesContents: FC<AdditionalMaterialsUserProps> = () => {
  const [stepNumber, setStepNumber] = useState<number>(0);
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

  const fetchMaterialModeration =
    trpc.additionalMaterials.generateAdditionalMaterialModeration.useMutation();
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();
  const generateLessonPlan =
    trpc.additionalMaterials.generatePartialLessonPlanObject.useMutation();

  const lessonFields = useMemo(() => {
    return lessonFieldKeys.filter((key) => pageData.lessonPlan[key]);
  }, [pageData.lessonPlan]);

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

  const handleSubmitLessonPlan = async ({
    title,
    subject,
    keyStage,
    year,
  }: {
    title: string;
    subject: string;
    keyStage: string;
    year: string;
  }) => {
    setStepNumber(1);
    const res = await generateLessonPlan.mutateAsync({
      title: title ?? "",
      subject: subject ?? "",
      year: year ?? "",
      lessonParts: ["title", "keyStage", "subject", ...lessonFields],
    });
    setPageData({ lessonPlan: { ...res } });
    console.log("lessonPlan", res);
  };

  const handleStepTwoSubmit = async (message?: string) => {
    setGeneration(null);
    if (!docType) {
      alert("No docType selected");
      return;
    }

    try {
      const res = await fetchMaterial.mutateAsync({
        documentType: docType,
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
          context: {
            lessonPlan: pageData.lessonPlan,
            previousOutput: generation ?? null,
            options: null,
            refinement: [{ type: refinement }],
          },
        });

        setGeneration(res);
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

  const titleAreaControl = {
    0: {
      title: "What do you want to teach?",
      subTitle: "These details will enable Aila to create a lesson overview.",
    },
    1: {
      title: "Review details",
      subTitle:
        "If these details are not quite right, try editing the previous page.",
    },
    2: {
      title: pageData.lessonPlan.title,
      subTitle: `${pageData.lessonPlan.keyStage} ${pageData.lessonPlan.subject}`,
    },
  };

  const stepComponents = {
    0: (
      <StepOne
        setDocType={setDocType}
        setModeration={setModeration}
        setGeneration={setGeneration}
        setStepNumber={setStepNumber}
        handleSubmitLessonPlan={handleSubmitLessonPlan}
      />
    ),
    1: (
      <StepTwo
        setStepNumber={setStepNumber}
        pageData={pageData}
        handleSubmit={handleStepTwoSubmit}
        docTypeName={docType?.split("-")[1] ?? null}
        isLessonPlanLoading={generateLessonPlan.isLoading}
      />
    ),
    2: (
      <StepThree
        fetchMaterial={fetchMaterial}
        fetchMaterialModeration={fetchMaterialModeration}
        renderGeneratedMaterial={renderGeneratedMaterial}
        moderation={moderation}
      />
    ),
  };

  return (
    <ResourcesLayout
      title={titleAreaControl[stepNumber].title}
      subTitle={titleAreaControl[stepNumber].subTitle}
      step={stepNumber + 1}
      docTypeName={docType?.split("-")[1] ?? null}
    >
      {stepComponents[stepNumber]}
    </ResourcesLayout>
  );
};

export default ResourcesContents;
