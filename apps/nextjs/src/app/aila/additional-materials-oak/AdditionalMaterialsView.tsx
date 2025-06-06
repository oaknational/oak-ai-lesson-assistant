"use client";

import type { FC } from "react";
import React from "react";

import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { kebabCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";

import { OakP, OakSpan } from "@oaknational/oak-components";

import StepFour from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepFour";
import StepOne from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepOne";
import StepThree from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepThree";
import StepTwo from "@/components/AppComponents/AdditionalMaterials/StepLayouts/StepTwo";
import { DialogProvider } from "@/components/AppComponents/DialogContext";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import ResourcesLayout from "@/components/ResourcesLayout";
import {
  ResourcesStoresProvider,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  docTypeSelector,
  pageDataSelector,
  stepNumberSelector,
} from "@/stores/resourcesStore/selectors";

export type AdditionalMaterialsPageProps = {
  lesson?: LooseLessonPlan;
  transcript?: string;
  initialStep?: number;
  docTypeFromQueryPrams?: string;
};

const ResourcesContentsInner: FC<AdditionalMaterialsPageProps> = () => {
  const stepNumber = useResourcesStore(stepNumberSelector);
  const pageData = useResourcesStore(pageDataSelector);
  const docType = useResourcesStore(docTypeSelector);

  // Get resource type information from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType?.displayName || null;

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
    0: <StepOne handleCreateSession={() => Promise.resolve()} />,
    1: <StepTwo handleSubmitLessonPlan={() => Promise.resolve()} />, // temp function to satisfy type
    2: <StepThree handleSubmit={() => null} />, // temp function to satisfy type
    3: <StepFour />,
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
      <DialogProvider>
        <DialogRoot>
          <DialogContents chatId={undefined} lesson={{}} />

          <ResourcesContentsInner {...props} />
        </DialogRoot>
      </DialogProvider>
    </ResourcesStoresProvider>
  );
};

export default AdditionalMaterialsView;
