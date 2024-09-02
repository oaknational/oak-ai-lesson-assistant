import { useEffect, useState } from "react";

import { Box, Flex } from "@radix-ui/themes";
import { usePosthogFeedbackSurvey } from "hooks/surveys/usePosthogFeedbackSurvey";

import FeedBack from "@/components/Feedback";

const EndOfLessonFeedback = ({ closeDialog }: { closeDialog: () => void }) => {
  const { survey, submitSurvey, closeDialogWithPostHogDismiss } =
    usePosthogFeedbackSurvey({
      closeDialog,
      surveyName: "End of Aila generation survey launch aug24",
    });

  const [userIsOnMobile, setUserIsOnMobile] = useState(false);

  // @TODO delete this before go live. This is for the purpose of the press launch as we do not have mobile designs for this page.
  useEffect(() => {
    setUserIsOnMobile(window.innerWidth < 768);
    if (userIsOnMobile) {
      closeDialog();
    }
  }, [userIsOnMobile, closeDialog]);

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

export default EndOfLessonFeedback;
