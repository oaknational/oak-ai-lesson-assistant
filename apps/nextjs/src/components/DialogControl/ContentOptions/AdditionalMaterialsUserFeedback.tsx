import { Box, Flex } from "@radix-ui/themes";

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
    <Box width="100%">
      <Flex direction="column" justify="center" align="center">
        {survey && (
          <FeedBack
            submitSurvey={submitSurvey}
            survey={survey}
            closeDialogWithPostHogDismiss={closeDialogWithPostHogDismiss}
            onSubmit={closeDialog}
          />
        )}
      </Flex>
    </Box>
  );
};

export default AdditionalMaterialsUserFeedback;
