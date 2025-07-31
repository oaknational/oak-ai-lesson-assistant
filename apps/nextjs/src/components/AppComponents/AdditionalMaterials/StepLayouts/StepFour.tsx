import { useEffect, useRef, useState } from "react";

import { isComprehensionTask } from "@oakai/additional-materials/src/documents/additionalMaterials/comprehension/schema";
import { isExitQuiz } from "@oakai/additional-materials/src/documents/additionalMaterials/exitQuiz/schema";
import { isGlossary } from "@oakai/additional-materials/src/documents/additionalMaterials/glossary/schema";
import { type AllowedRefinements } from "@oakai/additional-materials/src/documents/additionalMaterials/refinement/schema";
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
  OakPrimaryInvertedButton,
  OakSecondaryButton,
  OakSmallTertiaryInvertedButton,
} from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";
import styled, { css } from "styled-components";

import { SurveyDialogLauncher } from "@/app/aila/lesson/[id]/download/SurveyDialogLauncher";
import AiIcon from "@/components/AiIcon";
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

import { ComprehensionTask } from "../../AdditionalMaterials/ComprehensionTask";
import { Glossary } from "../../AdditionalMaterials/Glossary";
import { useDialog } from "../../DialogContext";
import { ModerationMessage } from "../AdditionalMaterialMessage";
import InlineButton from "../InlineButton";
import { Quiz } from "../Quiz";
import ResourcesFooter from "../ResourcesFooter";
import StepLoadingScreen from "../StepLoadingScreen";

const log = aiLogger("additional-materials");

const MockOakSecondaryButtonWithJustIcon = styled.button<{
  disabled: boolean;
}>`
  background: none;
  color: white;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  text-align: left;
  font-family: unset;
  outline: none;
  font-family: --var(google-font), Lexend, sans-serif;

  background: #222222;

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

const MobileNoLetterSpacingButton = styled(OakSecondaryButton)`
  @media (max-width: 600px) {
    button div span {
      letter-spacing: 0;
    }
  }
`;

type StepFourProps = {
  handleRefineMaterial: (refinementValue: RefinementOption) => Promise<void>;
};

const StepFour = ({ handleRefineMaterial }: StepFourProps) => {
  const generation = useResourcesStore(generationSelector);

  const docType = useResourcesStore(docTypeSelector);
  const isResourcesLoading = useResourcesStore(isResourcesLoadingSelector);
  const isResourceRefining = useResourcesStore(isResourceRefiningSelector);
  const refinementHistory = useResourcesStore(
    refinementGenerationHistorySelector,
  );

  const { undoRefinement } = useResourcesActions();
  const moderation = useResourcesStore(moderationSelector);
  const [isFooterAdaptOpen, setIsFooterAdaptOpen] = useState(false);
  const [userHasSeenSurvey, setUserHasSeenSurvey] = useState(false);
  const { downloadMaterial, setIsResourceDownloading } = useResourcesActions();
  const isDownloading = useResourcesStore(isResourcesDownloadingSelector);
  const { setDialogWindow } = useDialog();

  // Get resource type from configuration
  const resourceType = docType ? getResourceType(docType) : null;
  const refinementOptions = resourceType?.refinementOptions ?? [];

  const refinementRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isFooterAdaptOpen && refinementRefs.current[0]) {
      refinementRefs.current[0].focus();
    }
  }, [isFooterAdaptOpen]);

  useEffect(() => {
    if (refinementHistory.length > 0 && !isResourceRefining) {
      const btn = document.getElementById("undo-btn");
      btn?.focus();
    }
  }, [isResourceRefining, refinementHistory.length]);

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
      return <Quiz action={docType} generation={generation} />;
    }

    if (docType === "additional-exit-quiz" && isExitQuiz(generation)) {
      return <Quiz action={docType} generation={generation} />;
    }

    return null;
  };
  // if loading, show loading
  if (isResourcesLoading && !isResourceRefining) {
    return (
      <StepLoadingScreen
        docTypeName={resourceType?.displayName}
        source="teachingMaterial"
      />
    );
  }

  if (isDownloading && !userHasSeenSurvey) {
    setUserHasSeenSurvey(true);
    setDialogWindow("additional-materials-user-feedback");
  }

  return (
    <>
      {isResourcesLoading || (!generation && <OakP>Loading...</OakP>)}

      <OakFlex $mt={"space-between-m"}>{renderGeneratedMaterial()}</OakFlex>
      {moderation?.categories && moderation.categories.length > 0 && (
        <ModerationMessage />
      )}
      <ResourcesFooter>
        <OakFlex $flexDirection="column" $width="100%">
          {refinementHistory.length > 0 && !isResourceRefining && (
            <OakFlex
              $gap="all-spacing-2"
              $alignItems="center"
              $mb="space-between-m"
            >
              <OakP
                $mr={"space-between-m"}
                $font="body-2"
                $color="icon-success"
              >
                Done!
              </OakP>
              <OakSmallTertiaryInvertedButton
                id="undo-btn"
                onClick={undoRefinement}
                disabled={
                  isResourcesLoading || isResourceRefining || isDownloading
                }
                iconName={"chevron-left"}
              >
                Undo
              </OakSmallTertiaryInvertedButton>
            </OakFlex>
          )}
          <OakFlex $justifyContent="space-between" $width="100%">
            {isFooterAdaptOpen ? (
              <OakFlex
                $flexDirection="row"
                $gap="all-spacing-5"
                $width="100%"
                $justifyContent="space-between"
                $alignItems="center"
              >
                <OakFlex $gap="all-spacing-2" $flexWrap="wrap">
                  {isResourceRefining ? (
                    <OakFlex $alignItems="center" $gap="all-spacing-2">
                      <OakP $font="body-2">Working on it...</OakP>
                      <OakLoadingSpinner $width="all-spacing-6" />
                    </OakFlex>
                  ) : (
                    <>
                      {refinementOptions.map(
                        (refinement: RefinementOption, index) => (
                          <InlineButton
                            ref={(el) => (refinementRefs.current[index] = el)}
                            key={refinement.id}
                            onClick={() =>
                              void handleRefineMaterial(refinement)
                            }
                          >
                            {refinement.label}
                          </InlineButton>
                        ),
                      )}
                    </>
                  )}
                </OakFlex>
                <OakPrimaryInvertedButton
                  onClick={() => setIsFooterAdaptOpen(false)}
                  iconName="cross"
                >
                  Close
                </OakPrimaryInvertedButton>
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
                      data-testid="modify-desktop"
                      onClick={() => {
                        setIsFooterAdaptOpen(true);
                      }}
                      disabled={
                        refinementOptions.length === 0 ||
                        !generation ||
                        isDownloading
                      }
                    >
                      <OakFlex $alignItems="center" $gap="all-spacing-1">
                        <OakP $font="heading-7">Modify</OakP>
                        <AiIcon />
                      </OakFlex>
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
                  $flexDirection={["row", "row"]}
                >
                  <MobileNoLetterSpacingButton
                    onClick={() =>
                      setDialogWindow("additional-materials-start-again")
                    }
                  >
                    Start again
                  </MobileNoLetterSpacingButton>
                  <OakFlex $gap={"space-between-ssx"} $flexDirection={"row"}>
                    <MobileNoLetterSpacingButton
                      data-testid="modify-mobile"
                      onClick={() => {
                        setIsFooterAdaptOpen(true);
                      }}
                      disabled={
                        refinementOptions.length === 0 ||
                        !generation ||
                        isDownloading
                      }
                    >
                      Modify
                    </MobileNoLetterSpacingButton>
                    <MockOakSecondaryButtonWithJustIcon
                      onClick={() => void handleDownloadMaterial()}
                      disabled={
                        !generation || isResourcesLoading || isDownloading
                      }
                    >
                      {isDownloading ? (
                        <OakLoadingSpinner $width="all-spacing-6" />
                      ) : (
                        <OakIcon
                          iconName="download"
                          iconWidth="all-spacing-7"
                          $colorFilter={"white"}
                          data-testid="download-icon-button"
                        />
                      )}
                    </MockOakSecondaryButtonWithJustIcon>
                  </OakFlex>
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
