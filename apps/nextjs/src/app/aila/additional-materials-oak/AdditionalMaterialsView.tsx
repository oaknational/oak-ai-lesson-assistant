"use client";

import type { FC } from "react";
import React, { useEffect } from "react";

import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { kebabCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";
import { aiLogger } from "@oakai/logger";

import { OakP, OakSpan } from "@oaknational/oak-components";

import StepOne from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepOne";
import StepThree from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepThree";
import StepTwo from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepTwo";
import ResourcesLayout from "@/components/ResroucesLayout";
import {
  ResourcesStoresProvider,
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  docTypeSelector,
  pageDataSelector,
  stepNumberSelector,
} from "@/stores/resourcesStore/selectors";
import { trpc } from "@/utils/trpc";

export type AdditionalMaterialsPageProps = {
  lesson?: LooseLessonPlan;
  transcript?: string;
  initialStep?: number;
  docTypeFromQueryPrams?: string;
};

const log = aiLogger("additional-materials");

const ResourcesContentsInner: FC<AdditionalMaterialsPageProps> = ({
  initialStep,
  lesson,
  transcript,
  docTypeFromQueryPrams,
}) => {
  const stepNumber = useResourcesStore(stepNumberSelector);
  const pageData = useResourcesStore(pageDataSelector);
  const docType = useResourcesStore(docTypeSelector);
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();
  log.info("lessonPlan", lesson);

  // Get resource type information from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType?.displayName || null;
  const {
    resetFormState,
    setStepNumber,
    setPageData,
    setDocType,
    generateMaterial,
  } = useResourcesActions();

  // useEffect(() => {
  //   resetFormState();

  //   const handleSubmit = (message) => {
  //     const generatePromise = generateMaterial({
  //       message,
  //       mutateAsync: async (input) => {
  //         try {
  //           return fetchMaterial.mutateAsync(input);
  //         } catch (error) {
  //           throw error instanceof Error ? error : new Error(String(error));
  //         }
  //       },
  //     });

  //     // Navigate to the next step
  //     generatePromise
  //       .then(() => setStepNumber(2))
  //       .catch((error) => {
  //         log.error("Failed to generate material", error);
  //         // Sentry.captureException(error);
  //       });

  //     return generatePromise;
  //   };
  //   if (lesson && transcript && docType) {
  //     setPageData({
  //       lessonPlan: lesson,
  //       transcript: transcript,
  //     });
  //     setDocType(docType);

  //     void handleSubmit("hi");
  //   }
  // }, [
  //   docType,
  //   fetchMaterial,
  //   generateMaterial,
  //   lesson,
  //   pageData,
  //   resetFormState,
  //   setDocType,
  //   setPageData,
  //   setStepNumber,
  //   transcript,
  // ]);

  useEffect(() => {
    if (initialStep !== undefined && initialStep !== stepNumber) {
      setStepNumber(initialStep);
    }
  }, [initialStep, stepNumber, setStepNumber]);

  const titleAreaContent = {
    0: {
      title: "What do you want to teach?",
      subTitle: (
        <OakP $font="body-2" $color="grey70">
          These details will help Aila create a brief lesson overview, to
          provide context for your selected resource.
        </OakP>
      ),
    },
    1: {
      title: "Lesson overview",
      subTitle: (
        <OakP $font="body-2" $color="grey70">
          This lesson overview will provide context for your{" "}
          {<OakSpan $font="body-2-bold">{docTypeName}</OakSpan>}. If these
          details are not quite right, try editing the previous page.
        </OakP>
      ),
    },
    2: {
      title: pageData.lessonPlan.title,
      subTitle: (
        <OakP $font="body-2" $color="grey70">
          {kebabCaseToSentenceCase(pageData.lessonPlan.keyStage ?? "")} •{" "}
          {pageData.lessonPlan.subject}
        </OakP>
      ),
    },
  };

  const stepComponents = {
    0: <StepOne />,
    1: <StepTwo />,
    2: <StepThree />,
  };
  const stepNumberParsed = stepNumber as keyof typeof titleAreaContent;
  const title = titleAreaContent?.[stepNumberParsed]?.title ?? "";
  const subTitle = titleAreaContent?.[stepNumberParsed]?.subTitle ?? "";
  return (
    <ResourcesLayout
      title={title}
      subTitle={subTitle}
      step={stepNumber + 1}
      docTypeName={docTypeName || ""}
    >
      {stepComponents[stepNumber]}
    </ResourcesLayout>
  );
};

const AdditionalMaterialsView: FC<AdditionalMaterialsPageProps> = (props) => {
  return (
    <ResourcesStoresProvider>
      <ResourcesContentsInner {...props} />
    </ResourcesStoresProvider>
  );
};

export default AdditionalMaterialsView;
