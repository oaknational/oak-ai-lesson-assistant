"use client";

import type { FC } from "react";
import React, { useEffect } from "react";

import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";

import { OakP } from "@oaknational/oak-components";

import StepFour from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepFour";
import StepOne from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepOne";
import StepThree from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepThree";
import StepTwo from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepTwo";
import { handleDialogSelection } from "@/components/AppComponents/AdditionalMaterials/StepLayouts/helpers";
import {
  DialogProvider,
  useDialog,
} from "@/components/AppComponents/DialogContext";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import ResourcesLayout from "@/components/ResourcesLayout";
import {
  ResourcesStoresProvider,
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  docTypeSelector,
  pageDataSelector,
  stepNumberSelector,
  threatDetectionSelector,
  yearSelector,
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

const TeachingMaterialsViewInner: FC<AdditionalMaterialsUserProps> = () => {
  const stepNumber = useResourcesStore(stepNumberSelector);
  const pageData = useResourcesStore(pageDataSelector);
  const threatDetected = useResourcesStore(threatDetectionSelector);

  const docType = useResourcesStore(docTypeSelector);
  const year = useResourcesStore(yearSelector);
  const error = useResourcesStore((state) => state.error);

  // Get resource type information from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType?.displayName ?? null;
  const {
    resetFormState,
    createMaterialSession,
    submitLessonPlan,
    generateMaterial,
    refineMaterial,
  } = useResourcesActions();
  const { setDialogWindow } = useDialog();

  useEffect(() => {
    resetFormState();
  }, [resetFormState]);

  handleDialogSelection({
    threatDetected,
    error,
    setDialogWindow,
  });

  const titleAreaContent = {
    0: {
      title: "Select teaching material",
      subTitle: (
        <OakP $font="body-2" $color="text-primary">
          Choose the downloadable resource you'd like to create with Aila for
          your lesson.
        </OakP>
      ),
    },
    1: {
      title: "What are you teaching?",
      subTitle: (
        <OakP $font="body-2" $color="text-primary">
          The more detail you give, the better suited your resource will be for
          your lesson.
        </OakP>
      ),
    },
    2: {
      title: pageData.lessonPlan.title,
      subTitle: (
        <OakP $font="body-2" $color="text-primary">
          {`${year} • ${pageData.lessonPlan.subject}`}
        </OakP>
      ),
    },
    3: {
      title: pageData.lessonPlan.title,
      subTitle: (
        <OakP $font="body-2" $color="text-primary">
          {`${year} • ${pageData.lessonPlan.subject}`}
        </OakP>
      ),
    },
  };

  const stepComponents = {
    0: <StepOne handleCreateSession={createMaterialSession} />,
    1: <StepTwo handleSubmitLessonPlan={submitLessonPlan} />,
    2: <StepThree handleSubmit={generateMaterial} />,
    3: <StepFour handleRefineMaterial={refineMaterial} />,
  };
  const stepNumberParsed = stepNumber as keyof typeof titleAreaContent;
  const title = titleAreaContent?.[stepNumberParsed]?.title ?? "";
  const subTitle = titleAreaContent?.[stepNumberParsed]?.subTitle ?? "";
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

const TeachingMaterialsView: FC<AdditionalMaterialsUserProps> = (props) => {
  return (
    <ResourcesStoresProvider>
      <DialogProvider>
        <DialogRoot>
          <DialogContents chatId={undefined} lesson={{}} />
          <TeachingMaterialsViewInner {...props} />
        </DialogRoot>
      </DialogProvider>
    </ResourcesStoresProvider>
  );
};

export default TeachingMaterialsView;
