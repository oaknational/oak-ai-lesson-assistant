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

type AdditionalMaterialsInappropriateContentProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsInappropriateContent = ({
  closeDialog,
}: Readonly<AdditionalMaterialsInappropriateContentProps>) => {
  const { resetToDefault } = useResourcesActions();
  const moderation = useResourcesStore(moderationSelector);
  const id = useResourcesStore(pageDataSelector).lessonPlan.lessonId;
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
        "Aila is designed to create classroom-appropriate content. This topic has been identified as potentially unsuitable, preventing you from continuing to create teaching materials. Continuing to generate inappropriate content will result in your account being blocked. If you believe this is an error, please provide feedback."
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
      backButtonLabel="Back to start"
      onBack={() => {
        resetToDefault();
        closeDialog();
      }}
    />
  );
};

export default AdditionalMaterialsInappropriateContent;
