import { Box, Flex } from "@radix-ui/themes";
import { usePosthogFeedbackSurvey } from "hooks/surveys/usePosthogFeedbackSurvey";

import FeedBack from "@/components/Feedback";

const ChatActions = ({ closeDialog }: { closeDialog: () => void }) => {
  const { survey, submitSurvey, closeDialogWithPostHogDismiss } =
    usePosthogFeedbackSurvey({
      closeDialog,
      surveyName: "Chat Feedback With Stats",
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

export default ChatActions;
