"use client";

import type { FC } from "react";
import React, { useEffect } from "react";

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

interface AdditionalMaterialsUserProps {
  pageData: { "" };
}

const ResourcesContentsInner: FC<AdditionalMaterialsUserProps> = () => {
  const stepNumber = useResourcesStore(stepNumberSelector);
  const pageData = useResourcesStore(pageDataSelector);
  const docType = useResourcesStore(docTypeSelector);
  const { resetFormState } = useResourcesActions();

  useEffect(() => {
    resetFormState();
  }, [resetFormState]);

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
    0: <StepOne />,
    1: <StepTwo />,
    2: <StepThree />,
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

const ResourcesContents: FC<AdditionalMaterialsUserProps> = (props) => {
  return (
    <ResourcesStoresProvider>
      <ResourcesContentsInner {...props} />
    </ResourcesStoresProvider>
  );
};

export default ResourcesContents;
