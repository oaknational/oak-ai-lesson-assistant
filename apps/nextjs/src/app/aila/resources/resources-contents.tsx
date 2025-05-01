"use client";

import type { FC } from "react";
import React, { useEffect } from "react";

import { kebabCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";

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
  pageData?: {
    lessonPlan: {
      title: string;
      keyStage: string;
      subject: string;
    };
  };
}

const ResourcesContentsInner: FC<AdditionalMaterialsUserProps> = () => {
  const stepNumber = useResourcesStore(stepNumberSelector);
  const pageData = useResourcesStore(pageDataSelector);
  const docType = useResourcesStore(docTypeSelector);
  const docTypeName = docType?.split("-")[1] ?? null;
  const { resetFormState } = useResourcesActions();

  useEffect(() => {
    resetFormState();
  }, [resetFormState]);

  const titleAreaControl = {
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
      title: "Review details",
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
  const stepNumberParsed = stepNumber as keyof typeof titleAreaControl;
  const title = titleAreaControl?.[stepNumberParsed]?.title ?? "";
  const subTitle = titleAreaControl?.[stepNumberParsed]?.subTitle ?? "";
  return (
    <ResourcesLayout
      title={title}
      subTitle={subTitle}
      step={stepNumber + 1}
      docTypeName={docTypeName}
    >
      {stepComponents[stepNumber]}
    </ResourcesLayout>
  );
};

const ResourcesContents: FC<AdditionalMaterialsUserProps> = (props) => {
  return (
    <ResourcesStoresProvider>
      <ResourcesContentsInner {...props} />
    </ResourcesStoresProvider>
  );
};

export default ResourcesContents;
