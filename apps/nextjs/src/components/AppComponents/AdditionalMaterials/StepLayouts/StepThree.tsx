import { useState } from "react";

import { isComprehensionTask } from "@oakai/additional-materials/src/documents/additionalMaterials/comprehension/schema";
import { isExitQuiz } from "@oakai/additional-materials/src/documents/additionalMaterials/exitQuiz/schema";
import {
  isGlossary,
  readingAgeRefinement,
} from "@oakai/additional-materials/src/documents/additionalMaterials/glossary/schema";
import {
  type RefinementOption,
  getResourceType,
} from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { isStarterQuiz } from "@oakai/additional-materials/src/documents/additionalMaterials/starterQuiz/schema";
import { aiLogger } from "@oakai/logger";

import {
  OakFlex,
  OakIcon,
  OakP,
  OakPrimaryButton,
  OakSecondaryButton,
  OakSpan,
} from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  docTypeSelector,
  generationSelector,
  isResourcesDownloadingSelector,
  isResourcesLoadingSelector,
} from "@/stores/resourcesStore/selectors";
import { pageDataSelector } from "@/stores/resourcesStore/selectors";
import { trpc } from "@/utils/trpc";

import { ComprehensionTask } from "../../AdditionalMaterials/ComprehensionTask";
import { ExitQuiz } from "../../AdditionalMaterials/ExitQuiz";
import { Glossary } from "../../AdditionalMaterials/Glossary";
import { StarterQuiz } from "../../AdditionalMaterials/StarterQuiz";
import InlineButton from "../InlineButton";
import ResourcesFooter from "../ResourcesFooter";

const log = aiLogger("additional-materials");

const StepThree = () => {
  const generation = useResourcesStore(generationSelector);

  const docType = useResourcesStore(docTypeSelector);
  const isResourcesLoading = useResourcesStore(isResourcesLoadingSelector);
  const { setStepNumber, refineMaterial } = useResourcesActions();
  const [isFooterAdaptOpen, setIsFooterAdaptOpen] = useState(false);
  const { downloadMaterial, setIsResourceDownloading } = useResourcesActions();
  const isDownloading = useResourcesStore(isResourcesDownloadingSelector);
  const pageData = useResourcesStore(pageDataSelector);
  const lessonPlan = pageData?.lessonPlan;
  console.log("************lessonPlan", lessonPlan);
  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();

  // Get resource type from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const refinementOptions = resourceType?.refinementOptions || [];
  const handleDownloadMaterial = async () => {
    if (!generation || !docType) {
      return;
    }
    try {
      await downloadMaterial();
    } catch (err) {
      log.error("Download failed", err);
      Sentry.captureException(err);
    } finally {
      setIsResourceDownloading(false);
    }
  };

  const getRefinementOptions = () => {
    if (docType === "additional-glossary") {
      return readingAgeRefinement;
    }

    if (docType === "additional-comprehension") {
      return [];
    }

    return [];
  };

  const renderGeneratedMaterial = () => {
    if (!generation) {
      return null;
    }

    if (docType === "additional-glossary" && isGlossary(generation)) {
      return <Glossary action={docType} generation={generation} />;
    }

    if (
      docType === "additional-comprehension" &&
      isComprehensionTask(generation)
    ) {
      return <ComprehensionTask action={docType} generation={generation} />;
    }

    if (docType === "additional-starter-quiz" && isStarterQuiz(generation)) {
      return <StarterQuiz action={docType} generation={generation} />;
    }

    if (docType === "additional-exit-quiz" && isExitQuiz(generation)) {
      return <ExitQuiz action={docType} generation={generation} />;
    }

    return null;
  };

  return (
    <>
      {isResourcesLoading || (!generation && <OakP>Loading...</OakP>)}
      <OakFlex $mt={"space-between-m"}>{renderGeneratedMaterial()}</OakFlex>
      <ResourcesFooter>
        {isFooterAdaptOpen ? (
          <OakFlex $flexDirection="column" $gap="all-spacing-5" $width="100%">
            <button onClick={() => setIsFooterAdaptOpen(false)}>
              <OakFlex $alignItems="center" $gap="all-spacing-2">
                <OakIcon iconName="cross" />
                <OakSpan $color="black" $textDecoration="none" $font="body-2">
                  Close
                </OakSpan>
              </OakFlex>
            </button>

            <OakFlex $gap="all-spacing-2" $flexWrap="wrap">
              {refinementOptions.map((refinement: RefinementOption) => (
                <InlineButton
                  key={refinement.id}
                  onClick={() => {
                    void refineMaterial({
                      refinement: [{ type: refinement.value }],
                      mutateAsync: async (input) => {
                        try {
                          return await fetchMaterial.mutateAsync(input);
                        } catch (error) {
                          throw error instanceof Error
                            ? error
                            : new Error(String(error));
                        }
                      },
                    });
                    setIsFooterAdaptOpen(false);
                  }}
                >
                  {refinement.label}
                </InlineButton>
              ))}
            </OakFlex>
          </OakFlex>
        ) : (
          <OakFlex $justifyContent="space-between" $width={"100%"}>
            <OakSecondaryButton onClick={() => setStepNumber(0)}>
              Start again
            </OakSecondaryButton>
            <OakFlex $gap="all-spacing-2">
              <OakSecondaryButton
                onClick={() => {
                  setIsFooterAdaptOpen(true);
                }}
                disabled={
                  refinementOptions.length === 0 || !generation || isDownloading
                }
              >
                Adapt
              </OakSecondaryButton>
              <OakPrimaryButton
                onClick={() => void handleDownloadMaterial()}
                iconName="download"
                isTrailingIcon={true}
                isLoading={isDownloading}
                disabled={!generation || isResourcesLoading}
              >
                Download (.zip)
              </OakPrimaryButton>
            </OakFlex>
          </OakFlex>
        )}
      </ResourcesFooter>
    </>
  );
};

export default StepThree;
