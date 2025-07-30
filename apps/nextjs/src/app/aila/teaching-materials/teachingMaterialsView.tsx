"use client";

import type { FC } from "react";
import React from "react";

import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import type { LessonPlanSchemaTeachingMaterials } from "@oakai/additional-materials/src/documents/additionalMaterials/sharedSchema";

import { OakFlex } from "@oaknational/oak-components";

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

export type TeachingMaterialsPageProps = {
  lesson?: LessonPlanSchemaTeachingMaterials;
  initialStep?: number;
  id?: string;
  source?: "aila" | "owa";
  error?: Error;
  lessonId?: string;
  queryParams?: {
    lessonSlug: string;
    programmeSlug: string;
    docType: string;
  };
};

const TeachingMaterialsViewInner: FC<TeachingMaterialsPageProps> = () => {
  const stepNumber = useResourcesStore(stepNumberSelector);
  const pageData = useResourcesStore(pageDataSelector);
  const threatDetected = useResourcesStore(threatDetectionSelector);

  const docType = useResourcesStore(docTypeSelector);
  const year = useResourcesStore(yearSelector);
  const error = useResourcesStore((state) => state.error);
  const hasRestrictedWorks = useResourcesStore(
    (state) => state.pageData.lessonPlan.hasRestrictedWorks,
  );

  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType?.displayName ?? null;
  const {
    createMaterialSession,
    submitLessonPlan,
    generateMaterial,
    refineMaterial,
  } = useResourcesActions();
  const { setDialogWindow } = useDialog();

  handleDialogSelection({
    threatDetected,
    error,
    setDialogWindow,
  });

  const titleAreaContent = {
    0: {
      title: "Select teaching material",
      subTitle:
        "Choose the downloadable resource you'd like to create with Aila for your lesson.",
    },
    1: {
      title: "What are you teaching?",
      subTitle:
        "The more detail you give, the better suited your resource will be for your lesson.",
    },
    2: {
      title: pageData.lessonPlan.title,
      subTitle: `${year} • ${pageData.lessonPlan.subject}`,
    },
    3: {
      title: pageData.lessonPlan.title,
      subTitle: `${year} • ${pageData.lessonPlan.subject}`,
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
    <>
      {hasRestrictedWorks && (
        <OakFlex $alignItems="center">
          <span>Some works in this lesson are restricted. </span>
        </OakFlex>
      )}
      <ResourcesLayout
        title={title}
        subTitle={subTitle}
        step={stepNumber + 1}
        docTypeName={docTypeName}
      >
        {stepComponents[stepNumber]}
      </ResourcesLayout>
    </>
  );
};

const TeachingMaterialsView: FC<TeachingMaterialsPageProps> = (props) => {
  return (
    <ResourcesStoresProvider {...props}>
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
