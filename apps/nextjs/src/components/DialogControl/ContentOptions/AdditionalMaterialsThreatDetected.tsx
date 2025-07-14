import { getSafetyResult } from "@oakai/core/src/utils/ailaModeration/helpers";

import invariant from "tiny-invariant";

import { usePosthogFeedbackSurvey } from "@/hooks/surveys/usePosthogFeedbackSurvey";
import {
  useResourcesActions,
  useResourcesStore,
} from "@/stores/ResourcesStoreProvider";
import {
  moderationSelector,
  pageDataSelector,
} from "@/stores/resourcesStore/selectors";

import AdditionalMaterialsModerationFeedback from "./AdditionalMaterialsModerationFeedback";

type AdditionalMaterialsThreatDetectedProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsThreatDetected = ({
  closeDialog,
}: Readonly<AdditionalMaterialsThreatDetectedProps>) => {
  const { resetToDefault } = useResourcesActions();
  const moderation = useResourcesStore(moderationSelector);
  const id = useResourcesStore(pageDataSelector).lessonPlan.lessonId;
  const setStepNumber = useResourcesActions().setStepNumber;
  invariant(moderation, "Moderation data is required for this component");
  const { submitSurveyWithOutClosing } = usePosthogFeedbackSurvey({
    surveyName: "Moderation feedback",
  });

  return (
    <AdditionalMaterialsModerationFeedback
      closeDialog={closeDialog}
      resetToDefault={resetToDefault}
      heading="Potential misuse of Aila detected"
      message={
        "This request has been identified as a potential misuse of Aila. Please rephrase or try a different request. If you think this is an error, please give us feedback below."
      }
      submitSurvey={(feedback) => {
        submitSurveyWithOutClosing({
          $survey_response: getSafetyResult(moderation),
          $survey_response_1: moderation.categories,
          $survey_response_2: null,
          $survey_response_3: id,
          $survey_response_4: feedback,
          $survey_response_5: "teaching-materials",
        });
      }}
      backButtonLabel="Back to lesson details"
      onBack={() => {
        setStepNumber(1);
        closeDialog();
      }}
    />
  );
};

export default AdditionalMaterialsThreatDetected;
