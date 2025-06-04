import { useState } from "react";

import { getSafetyResult } from "@oakai/core/src/utils/ailaModeration/helpers";

import {
  OakFlex,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
  OakTextInput,
} from "@oaknational/oak-components";
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

type AdditionalMaterialsThreatDetectProps = {
  closeDialog: () => void;
  body: string;
};

const AdditionalMaterialsInappropriateContent = ({
  closeDialog,
  body,
}: Readonly<AdditionalMaterialsThreatDetectProps>) => {
  const { resetToDefault } = useResourcesActions();
  const moderation = useResourcesStore(moderationSelector);
  const id = useResourcesStore(pageDataSelector).lessonPlan.lessonId;

  invariant(moderation, "Moderation data is required for this component");
  const { submitSurveyWithOutClosing } = usePosthogFeedbackSurvey({
    surveyName: "Moderation feedback",
  });
  const [feedback, setFeedback] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  if (submittedFeedback) {
    return (
      <OakFlex
        $width="100%"
        $height="100%"
        $flexDirection="column"
        $justifyContent="space-between"
        $gap={"space-between-m2"}
      >
        <OakP>Your feedback has been submitted.</OakP>
        <OakFlex $justifyContent={"flex-end"}>
          <OakPrimaryButton
            onClick={() => {
              resetToDefault();
              closeDialog();
            }}
          >
            Back to start
          </OakPrimaryButton>
        </OakFlex>
      </OakFlex>
    );
  }

  return (
    <OakFlex
      $width="100%"
      $height="100%"
      $flexDirection="column"
      $justifyContent="space-between"
      $gap={"space-between-m2"}
    >
      <OakP>{body}</OakP>
      <OakTextInput
        value={feedback}
        $minHeight={"all-spacing-11"}
        placeholder="Your feedback"
        onChange={(e) => setFeedback(e.target.value)}
      />

      <OakFlex
        $flexDirection="row"
        $alignItems={"center"}
        $justifyContent="space-between"
      >
        <OakSecondaryLink
          onClick={() => {
            resetToDefault();
            closeDialog();
          }}
        >
          Back to start
        </OakSecondaryLink>
        <OakPrimaryButton
          onClick={() => {
            submitSurveyWithOutClosing({
              $survey_response: getSafetyResult(moderation),
              $survey_response_1: moderation.categories,
              $survey_response_2: null, // moderation ID is not available in this context
              $survey_response_3: null, // chatId is not available in this context, using additional materials id
              $survey_response_4: feedback,
              $survey_response_5: id, // partial lesson plan ID
            });
            setSubmittedFeedback(true);
          }}
        >
          Submit feedback
        </OakPrimaryButton>
      </OakFlex>
    </OakFlex>
  );
};

export default AdditionalMaterialsInappropriateContent;
