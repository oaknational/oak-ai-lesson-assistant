import {
  getSafetyResult,
  moderationSlugToDescription,
} from "@oakai/core/src/utils/ailaModeration/helpers";

import invariant from "tiny-invariant";

import { usePosthogFeedbackSurvey } from "@/hooks/surveys/usePosthogFeedbackSurvey";
import { useTeachingMaterialsStore } from "@/stores/TeachingMaterialsStoreProvider";
import {
  moderationSelector,
  pageDataSelector,
} from "@/stores/teachingMaterialsStore/selectors";

import AdditionalMaterialsModerationFeedback from "./AdditionalMaterialsModerationFeedback";

type AdditionalMaterialsModerationProps = {
  closeDialog: () => void;
};

const AdditionalMaterialsModeration = ({
  closeDialog,
}: Readonly<AdditionalMaterialsModerationProps>) => {
  const moderation = useTeachingMaterialsStore(moderationSelector);
  const id = useTeachingMaterialsStore(pageDataSelector).lessonPlan.lessonId;
  invariant(moderation, "Moderation data is required for this component");
  const { submitSurveyWithOutClosing } = usePosthogFeedbackSurvey({
    surveyName: "Moderation feedback",
  });

  const message = `  Contains 
              ${moderation.categories.map(moderationSlugToDescription).join(", ")}.
              Check content carefully. If you have feedback on this guidance,
              please provide details below.`;

  return (
    <AdditionalMaterialsModerationFeedback
      closeDialog={closeDialog}
      heading="Content guidance"
      message={message}
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
      backButtonLabel="Back"
      onBack={closeDialog}
    />
  );
};

export default AdditionalMaterialsModeration;
