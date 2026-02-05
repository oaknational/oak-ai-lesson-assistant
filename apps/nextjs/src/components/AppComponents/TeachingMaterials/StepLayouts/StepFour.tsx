import { useEffect, useRef, useState } from "react";

import { aiLogger } from "@oakai/logger";
import { isComprehensionTask } from "@oakai/teaching-materials/src/documents/teachingMaterials/comprehension/schema";
import { isExitQuiz } from "@oakai/teaching-materials/src/documents/teachingMaterials/exitQuiz/schema";
import { isGlossary } from "@oakai/teaching-materials/src/documents/teachingMaterials/glossary/schema";
import {
  type RefinementOption,
  getMaterialType,
} from "@oakai/teaching-materials/src/documents/teachingMaterials/materialTypes";
import { isStarterQuiz } from "@oakai/teaching-materials/src/documents/teachingMaterials/starterQuiz/schema";

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
import { useOakConsent } from "@oaknational/oak-consent-client";
import * as Sentry from "@sentry/nextjs";
import styled, { css } from "styled-components";

import AiIcon from "@/components/AiIcon";
import { ServicePolicyMap } from "@/lib/cookie-consent/ServicePolicyMap";
import {
  useTeachingMaterialsActions,
  useTeachingMaterialsStore,
} from "@/stores/TeachingMaterialsStoreProvider";
import {
  docTypeSelector,
  generationSelector,
  isMaterialLoadingSelector,
  isMaterialRefiningSelector,
  isResourcesDownloadingSelector,
  moderationSelector,
  refinementGenerationHistorySelector,
} from "@/stores/teachingMaterialsStore/selectors";

import { useDialog } from "../../DialogContext";
import { ComprehensionTask } from "../ComprehensionTask";
import { Glossary } from "../Glossary";
import InlineButton from "../InlineButton";
import { Quiz } from "../Quiz";
import ResourcesFooter from "../ResourcesFooter";
import StepLoadingScreen from "../StepLoadingScreen";
import { ModerationMessage } from "../TeachingMaterialMessage";

const log = aiLogger("teaching-materials");

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
  font-family: var(--font-lexend), Lexend, sans-serif;

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
  const generation = useTeachingMaterialsStore(generationSelector);

  const docType = useTeachingMaterialsStore(docTypeSelector);
  const isMaterialLoading = useTeachingMaterialsStore(
    isMaterialLoadingSelector,
  );
  const isMaterialRefining = useTeachingMaterialsStore(
    isMaterialRefiningSelector,
  );
  const refinementHistory = useTeachingMaterialsStore(
    refinementGenerationHistorySelector,
  );

  const { undoRefinement } = useTeachingMaterialsActions();
  const moderation = useTeachingMaterialsStore(moderationSelector);
  const [isFooterAdaptOpen, setIsFooterAdaptOpen] = useState(false);
  const [userHasSeenSurvey, setUserHasSeenSurvey] = useState(false);
  const { downloadMaterial, setIsResourceDownloading } =
    useTeachingMaterialsActions();
  const isDownloading = useTeachingMaterialsStore(
    isResourcesDownloadingSelector,
  );
  const { setDialogWindow } = useDialog();
  const { getConsent } = useOakConsent();
  const posthogConsent = getConsent(ServicePolicyMap.POSTHOG);

  // Get resource type from configuration
  const materialType = docType ? getMaterialType(docType) : null;
  const refinementOptions = materialType?.refinementOptions ?? [];

  const refinementRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isFooterAdaptOpen && refinementRefs.current[0]) {
      refinementRefs.current[0].focus();
    }
  }, [isFooterAdaptOpen]);

  useEffect(() => {
    if (refinementHistory.length > 0 && !isMaterialRefining) {
      const btn = document.getElementById("undo-btn");
      btn?.focus();
    }
  }, [isMaterialRefining, refinementHistory.length]);

  useEffect(() => {
    if (isDownloading && !userHasSeenSurvey && posthogConsent === "granted") {
      setUserHasSeenSurvey(true);
      setDialogWindow("teaching-materials-user-feedback");
    }
  }, [isDownloading, posthogConsent, setDialogWindow, userHasSeenSurvey]);

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
  if (isMaterialLoading && !isMaterialRefining) {
    return (
      <StepLoadingScreen
        docTypeName={materialType?.displayName}
        source="teachingMaterial"
      />
    );
  }

  return (
    <>
      {isMaterialLoading || (!generation && <OakP>Loading...</OakP>)}
      <OakFlex $mt={"spacing-24"}>{renderGeneratedMaterial()}</OakFlex>
      {moderation?.categories && moderation.categories.length > 0 && (
        <ModerationMessage />
      )}
      <ResourcesFooter>
        <OakFlex $flexDirection="column" $width="100%">
          {refinementHistory.length > 0 && !isMaterialRefining && (
            <OakFlex $gap="spacing-8" $alignItems="center" $mb="spacing-24">
              <OakP $mr={"spacing-24"} $font="body-2" $color="icon-success">
                Done!
              </OakP>
              <OakSmallTertiaryInvertedButton
                id="undo-btn"
                onClick={undoRefinement}
                disabled={
                  isMaterialLoading || isMaterialRefining || isDownloading
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
                $gap="spacing-20"
                $width="100%"
                $justifyContent="space-between"
                $alignItems="center"
              >
                <OakFlex $gap="spacing-8" $flexWrap="wrap">
                  {isMaterialRefining ? (
                    <OakFlex $alignItems="center" $gap="spacing-8">
                      <OakP $font="body-2">Working on it...</OakP>
                      <OakLoadingSpinner $width="spacing-24" />
                    </OakFlex>
                  ) : (
                    <>
                      {refinementOptions.map(
                        (refinement: RefinementOption, index) => (
                          <InlineButton
                            ref={(el) => {
                              refinementRefs.current[index] = el;
                            }}
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
                  $gap="spacing-8"
                >
                  <OakSecondaryButton
                    onClick={() =>
                      setDialogWindow("teaching-materials-start-again")
                    }
                  >
                    Create more
                  </OakSecondaryButton>
                  <OakFlex $gap="spacing-8">
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
                      <OakFlex $alignItems="center" $gap="spacing-4">
                        <OakP $font="heading-7">Modify</OakP>
                        <AiIcon />
                      </OakFlex>
                    </OakSecondaryButton>
                    <OakPrimaryButton
                      onClick={() => void handleDownloadMaterial()}
                      iconName="download"
                      isTrailingIcon={true}
                      isLoading={isDownloading}
                      disabled={!generation || isMaterialLoading}
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
                  $gap="spacing-8"
                  $flexDirection={["row", "row"]}
                >
                  <MobileNoLetterSpacingButton
                    onClick={() =>
                      setDialogWindow("teaching-materials-start-again")
                    }
                  >
                    Create more
                  </MobileNoLetterSpacingButton>
                  <OakFlex $gap={"spacing-8"} $flexDirection={"row"}>
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
                        !generation || isMaterialLoading || isDownloading
                      }
                    >
                      {isDownloading ? (
                        <OakLoadingSpinner $width="spacing-24" />
                      ) : (
                        <OakIcon
                          iconName="download"
                          iconWidth="spacing-32"
                          $colorFilter={"icon-inverted"}
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
