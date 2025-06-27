"use client";

import type { FC } from "react";
import React, { useEffect, useRef } from "react";

import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import type { LessonPlanSchemaTeachingMaterials } from "@oakai/additional-materials/src/documents/additionalMaterials/sharedSchema";

import { OakP } from "@oaknational/oak-components";

import StepFour from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepFour";
import StepOne from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepOne";
import StepThree from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepThree";
import StepTwo from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepTwo";
import { handleDialogSelection } from "@/components/AppComponents/AdditionalMaterials/StepLayouts/helpers";
import useStepSubmitLogic from "@/components/AppComponents/AdditionalMaterials/hooks/useStepSubmitLogic";
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
  transcript?: string;
  initialStep?: number;
  docTypeFromQueryPrams?: string;
  id?: string;
  source?: "aila" | "owa";
  error?: string;
  lessonId?: string;
};

const TeachingMaterialsViewInner: FC<TeachingMaterialsPageProps> = (props) => {
  const stepNumber = useResourcesStore(stepNumberSelector);
  const pageData = useResourcesStore(pageDataSelector);
  const threatDetected = useResourcesStore(threatDetectionSelector);

  const docType = useResourcesStore(docTypeSelector);
  const year = useResourcesStore(yearSelector);
  const error = useResourcesStore((state) => state.error);
  const source = useResourcesStore((state) => state.source);
  const { loadOwaDataToStore } = useResourcesActions();

  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType?.displayName ?? null;

  const { setDialogWindow } = useDialog();
  const {
    handleSubmitLessonPlan,
    handleSubmit,
    handleCreateSession,
    handleRefineMaterial,
  } = useStepSubmitLogic();
  const handleSubmitRef = useRef(handleSubmit);

  useEffect(() => {
    if (source === "owa" && !props.error) {
      loadOwaDataToStore({
        lesson: props.lesson,
        transcript: props.transcript,
        initialStep: props.initialStep,
        docTypeFromQueryPrams: props.docTypeFromQueryPrams,
        id: props.id,
        lessonId: props.lessonId,
      });

      handleSubmitRef.current();
    }
  }, [
    source,
    loadOwaDataToStore,
    props.lesson,
    props.transcript,
    props.initialStep,
    props.docTypeFromQueryPrams,
    props.id,
    props.error,
    props.lessonId,
  ]);

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
    0: <StepOne handleCreateSession={handleCreateSession} />,
    1: <StepTwo handleSubmitLessonPlan={handleSubmitLessonPlan} />,
    2: <StepThree handleSubmit={handleSubmit} />,
    3: <StepFour handleRefineMaterial={handleRefineMaterial} />,
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
