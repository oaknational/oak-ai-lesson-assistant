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

interface AdditionalMaterialsUserProps {
  lessonPlan: LooseLessonPlan;
  initialStep?: number;
  docType?: string;
}

const log = aiLogger("additional-materials");

const ResourcesContentsInner: FC<AdditionalMaterialsUserProps> = ({
  initialStep,
  lessonPlan,
}) => {
  const stepNumber = useResourcesStore(stepNumberSelector);
  const pageData = useResourcesStore(pageDataSelector);
  const docType = useResourcesStore(docTypeSelector);

  log.info("lessonPlan", lessonPlan);

  // Get resource type information from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType?.displayName || null;
  const { resetFormState, setStepNumber } = useResourcesActions();

  useEffect(() => {
    resetFormState();
  }, [resetFormState]);

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

const AdditionalMaterialsView: FC<AdditionalMaterialsUserProps> = (props) => {
  return (
    <ResourcesStoresProvider initialStep={0}>
      <ResourcesContentsInner {...props} />
    </ResourcesStoresProvider>
  );
};

export default AdditionalMaterialsView;
