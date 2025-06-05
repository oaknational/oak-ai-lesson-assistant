import { useState } from "react";

import { isComprehensionTask } from "@oakai/additional-materials/src/documents/additionalMaterials/comprehension/schema";
import { isExitQuiz } from "@oakai/additional-materials/src/documents/additionalMaterials/exitQuiz/schema";
import { isGlossary } from "@oakai/additional-materials/src/documents/additionalMaterials/glossary/schema";
import {
  type RefinementOption,
  getResourceType,
} from "@oakai/additional-materials/src/documents/additionalMaterials/resourceTypes";
import { isStarterQuiz } from "@oakai/additional-materials/src/documents/additionalMaterials/starterQuiz/schema";
import { aiLogger } from "@oakai/logger";

import {
  OakFlex,
  OakIcon,
  OakLoadingSpinner,
  OakP,
  OakPrimaryButton,
  OakSecondaryButton,
  OakSpan,
} from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";
import styled, { css } from "styled-components";

import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  docTypeSelector,
  generationSelector,
  isResourceRefiningSelector,
  isResourcesDownloadingSelector,
  isResourcesLoadingSelector,
  moderationSelector,
  refinementGenerationHistorySelector,
} from "@/stores/resourcesStore/selectors";
import { trpc } from "@/utils/trpc";

import { ComprehensionTask } from "../../AdditionalMaterials/ComprehensionTask";
import { ExitQuiz } from "../../AdditionalMaterials/ExitQuiz";
import { Glossary } from "../../AdditionalMaterials/Glossary";
import { StarterQuiz } from "../../AdditionalMaterials/StarterQuiz";
import { useDialog } from "../../DialogContext";
import { ModerationMessage } from "../AdditionalMaterialMessage";
import InlineButton from "../InlineButton";
import ResourcesFooter from "../ResourcesFooter";
import StepLoadingScreen from "../StepLoadingScreen";

const log = aiLogger("additional-materials");

const MockOakSecondaryButtonWithJustIcon = styled.button<{
  disabled: boolean;
}>`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  text-align: left;
  font-family: unset;
  outline: none;
  font-family: --var(google-font), Lexend, sans-serif;
  color: #222222;
  background: #ffffff;
  padding: 0.75rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border: 0.125rem solid;
  border-color: #222222;
  border-radius: 0.25rem;
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
    `}
`;

const StepFour = () => {
  const generation = useResourcesStore(generationSelector);

  const docType = useResourcesStore(docTypeSelector);
  const isResourcesLoading = useResourcesStore(isResourcesLoadingSelector);
  const isResourceRefining = useResourcesStore(isResourceRefiningSelector);
  const refinementHistory = useResourcesStore(
    refinementGenerationHistorySelector,
  );

  const { setStepNumber, refineMaterial, undoRefinement } =
    useResourcesActions();
  const moderation = useResourcesStore(moderationSelector);
  const [isFooterAdaptOpen, setIsFooterAdaptOpen] = useState(false);
  const { downloadMaterial, setIsResourceDownloading } = useResourcesActions();
  const isDownloading = useResourcesStore(isResourcesDownloadingSelector);
  const { setDialogWindow } = useDialog();

  const fetchMaterial =
    trpc.additionalMaterials.generateAdditionalMaterial.useMutation();

  // Get resource type from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const refinementOptions = resourceType?.refinementOptions ?? [];
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
  // if loading, show loading
  if (isResourcesLoading || isResourceRefining) {
    return (
      <StepLoadingScreen
        nameOfWhatIsBuilding={resourceType?.displayName ?? ""}
      />
    );
  }

  return (
    <>
      {isResourcesLoading || (!generation && <OakP>Loading...</OakP>)}

      {moderation?.categories && moderation.categories.length > 0 && (
        <ModerationMessage />
      )}
      <OakFlex $mt={"space-between-m"}>{renderGeneratedMaterial()}</OakFlex>
      <ResourcesFooter>
        <OakFlex $flexDirection="column" $width="100%">
          {refinementHistory.length > 0 && (
            <OakFlex
              $gap="all-spacing-2"
              $alignItems="center"
              $mb="space-between-m"
            >
              <OakP $font="body-2" $color="icon-success">
                Done!
              </OakP>
              <button
                onClick={undoRefinement}
                disabled={
                  isResourcesLoading || isResourceRefining || isDownloading
                }
              >
                <OakFlex $alignItems="center">
                  <OakIcon iconName="cross" iconWidth="all-spacing-4" />
                  <OakSpan $font="body-2">Undo</OakSpan>
                </OakFlex>
              </button>
            </OakFlex>
          )}
          <OakFlex $justifyContent="space-between" $width="100%">
            {isFooterAdaptOpen ? (
              <OakFlex
                $flexDirection="column"
                $gap="all-spacing-5"
                $width="100%"
              >
                <button onClick={() => setIsFooterAdaptOpen(false)}>
                  <OakFlex $alignItems="center" $gap="all-spacing-2">
                    <OakIcon iconName="cross" />
                    <OakSpan
                      $color="black"
                      $textDecoration="none"
                      $font="body-2"
                    >
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
              <>
                {/* desktop layout */}
                <OakFlex
                  $justifyContent={["space-between"]}
                  $display={["none", "flex"]}
                  $width={"100%"}
                  $gap="all-spacing-2"
                >
                  <OakSecondaryButton
                    onClick={() =>
                      setDialogWindow("additional-materials-start-again")
                    }
                  >
                    Start again
                  </OakSecondaryButton>
                  <OakFlex $gap="all-spacing-2">
                    <OakSecondaryButton
                      onClick={() => {
                        setIsFooterAdaptOpen(true);
                      }}
                      disabled={
                        refinementOptions.length === 0 ||
                        !generation ||
                        isDownloading
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
                {/* mobile layout */}
                <OakFlex
                  $justifyContent={["space-between"]}
                  $display={["flex", "none"]}
                  $width={"100%"}
                  $gap="all-spacing-2"
                >
                  <MockOakSecondaryButtonWithJustIcon
                    onClick={() => void handleDownloadMaterial()}
                    disabled={
                      !generation || isResourcesLoading || isDownloading
                    }
                  >
                    {isDownloading ? (
                      <OakLoadingSpinner $width="all-spacing-6" />
                    ) : (
                      <OakIcon iconName="download" iconWidth="all-spacing-7" />
                    )}
                  </MockOakSecondaryButtonWithJustIcon>
                  <OakSecondaryButton
                    onClick={() => {
                      setIsFooterAdaptOpen(true);
                    }}
                    disabled={
                      refinementOptions.length === 0 ||
                      !generation ||
                      isDownloading
                    }
                  >
                    Adapt
                  </OakSecondaryButton>
                  <OakSecondaryButton
                    onClick={() =>
                      setDialogWindow("additional-materials-start-again")
                    }
                  >
                    Start again
                  </OakSecondaryButton>
                </OakFlex>
              </>
            )}
          </OakFlex>
        </OakFlex>
      </ResourcesFooter>
    </>
  );
};

export default StepFour;
