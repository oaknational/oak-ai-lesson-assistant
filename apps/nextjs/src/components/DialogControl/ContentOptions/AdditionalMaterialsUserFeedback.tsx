import { OakBox, OakFlex } from "@oaknational/oak-components";

import FeedBack from "@/components/Feedback";
import { usePosthogFeedbackSurvey } from "@/hooks/surveys/usePosthogFeedbackSurvey";

const AdditionalMaterialsUserFeedback = ({
  closeDialog,
}: {
  readonly closeDialog: () => void;
}) => {
  const { survey, submitSurvey, closeDialogWithPostHogDismiss } =
    usePosthogFeedbackSurvey({
      closeDialog,
      surveyName: "Teaching material feedback",
    });

  return (
    <OakBox $width="100%">
      <OakFlex
        $flexDirection="column"
        $justifyContent="center"
        $alignItems="center"
      >
        {survey && (
          <FeedBack
            submitSurvey={submitSurvey}
            survey={survey}
            closeDialogWithPostHogDismiss={closeDialogWithPostHogDismiss}
            onSubmit={closeDialog}
          />
        )}
      </OakFlex>
    </OakBox>
  );
};

export default AdditionalMaterialsUserFeedback;
