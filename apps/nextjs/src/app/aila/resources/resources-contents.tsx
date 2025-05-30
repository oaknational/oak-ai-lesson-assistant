"use client";

import type { FC } from "react";
import React, { useEffect } from "react";

import { getResourceType } from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { kebabCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";

import { OakP, OakSpan } from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";

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
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  docTypeSelector,
  moderationSelector,
  pageDataSelector,
  stepNumberSelector,
} from "@/stores/resourcesStore/selectors";
import { trpc } from "@/utils/trpc";

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

  // Get resource type information from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const docTypeName = resourceType?.displayName || null;
  const { resetFormState, submitLessonPlan, setStepNumber, generateMaterial } =
    useResourcesActions();

  const generateLessonPlan =
    trpc.additionalMaterials.generatePartialLessonPlanObject.useMutation();

  // Handle submit for step 2
  const handleSubmitLessonPlan = async (params: {
    title: string;
    subject: string;
    keyStage: string;
    year: string;
  }) => {
    try {
      await submitLessonPlan({
        ...params,
        mutateAsync: async (input) => {
          try {
            const result = await generateLessonPlan.mutateAsync(input);
            if (!result) {
              throw new Error("Mutation returned null");
            }
            return result;
          } catch (error) {
            throw error instanceof Error ? error : new Error(String(error));
          }
        },
      });
      // Navigate to step 2 (lesson overview) after successful lesson plan generation
      setStepNumber(2);
    } catch (error) {
      console.error("Failed to generate lesson plan:", error);
    }
  };

  // Handle submit for step 3
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();

  const handleSubmit = () => {
    // Immediately navigate to next step to show loading
    setStepNumber(3);
    // Start material generation
    void generateMaterial({
      mutateAsync: async (input) => {
        try {
          return await fetchMaterial.mutateAsync(input);
        } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          Sentry.captureException(error);
          throw error;
        }
      },
    });
  };

  useEffect(() => {
    resetFormState();
  }, [resetFormState]);

  const titleAreaContent = {
    0: {
      title: "What type of resource do you need?",
      subTitle: (
        <OakP $font="body-2" $color="grey70">
          Choose the type of additional material you'd like to create for your
          lesson.
        </OakP>
      ),
    },
    1: {
      title: "What do you want to teach?",
      subTitle: (
        <OakP $font="body-2" $color="grey70">
          These details will help Aila create a brief lesson overview, to
          provide context for your selected resource.
        </OakP>
      ),
    },
    2: {
      title: "Lesson overview",
      subTitle: (
        <OakP $font="body-2" $color="grey70">
          This lesson overview will provide context for your{" "}
          {<OakSpan $font="body-2-bold">{docTypeName}</OakSpan>}. If these
          details are not quite right, try editing the previous page.
        </OakP>
      ),
    },
    3: {
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
    1: <StepTwo handleSubmitLessonPlan={handleSubmitLessonPlan} />,
    2: <StepThree handleSubmit={handleSubmit} />,
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
      docTypeName={docTypeName}
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
          <DialogContents chatId={undefined} lesson={{}} />

          <ResourcesContentsInner {...props} />
        </DialogRoot>
      </DialogProvider>
    </ResourcesStoresProvider>
  );
};

export default ResourcesContents;
