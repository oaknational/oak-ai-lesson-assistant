"use client";

import type { FC } from "react";
import React, { useEffect } from "react";

import StepOne from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepOne";
import StepThree from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepThree";
import StepTwo from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepTwo";
import { DialogProvider } from "@/components/AppComponents/DialogContext";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
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
  const stepNumberParsed = stepNumber as keyof typeof titleAreaControl;
  const title = titleAreaControl?.[stepNumberParsed]?.title ?? "";
  const subTitle = titleAreaControl?.[stepNumberParsed]?.subTitle ?? "";
  return (
    <ResourcesLayout
      title={title}
      subTitle={subTitle}
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
      <DialogProvider>
        <DialogRoot>
          <DialogContents chatId={undefined} lesson={{}} submit={() => {}} />
          <ResourcesContentsInner {...props} />
        </DialogRoot>
      </DialogProvider>
    </ResourcesStoresProvider>
  );
};

export default ResourcesContents;
