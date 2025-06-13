import { getSafetyResult } from "@oakai/core/src/utils/ailaModeration/helpers";

import invariant from "tiny-invariant";

import { usePosthogFeedbackSurvey } from "@/hooks/surveys/usePosthogFeedbackSurvey";
import { useResourcesStore } from "@/stores/ResourcesStoreProvider";
import {
  moderationSelector,
  pageDataSelector,
} from "@/stores/resourcesStore/selectors";

import AdditionalMaterialsModerationFeedback from "./AdditionalMaterialsModerationFeedback";

type AdditionalMaterialsModerationProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsModeration = ({
  closeDialog,
}: Readonly<AdditionalMaterialsModerationProps>) => {
  const moderation = useResourcesStore(moderationSelector);
  const id = useResourcesStore(pageDataSelector).lessonPlan.lessonId;
  invariant(moderation, "Moderation data is required for this component");
  const { submitSurveyWithOutClosing } = usePosthogFeedbackSurvey({
    surveyName: "Moderation feedback",
  });

  return (
    <AdditionalMaterialsModerationFeedback
      closeDialog={closeDialog}
      heading="Guidance Required"
      message={moderation.justification}
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
      backButtonLabel="Back to lesson"
      onBack={closeDialog}
    />
  );
};

export default AdditionalMaterialsModeration;
