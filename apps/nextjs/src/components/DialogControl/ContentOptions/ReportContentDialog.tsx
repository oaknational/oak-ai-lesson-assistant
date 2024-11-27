import { useState } from "react";

import { aiLogger } from "@oakai/logger";
import {
  OakFlex,
  OakP,
  OakPrimaryButton,
  OakTextInput,
} from "@oaknational/oak-components";
import { Flex } from "@radix-ui/themes";
import type { Message } from "ai";
import { usePosthogFeedbackSurvey } from "hooks/surveys/usePosthogFeedbackSurvey";

import ModalFooterButtons from "./ModalFooterButtons";

const log = aiLogger("chat");

type ShareChatProps = {
  chatId: string | undefined;
  closeDialog: () => void;
  messages?: Message[];
};

const ReportContentDialog = ({
  chatId,
  messages,
  closeDialog,
}: Readonly<ShareChatProps>) => {
  const [userHasSubmitted, setUserHasSubmitted] = useState(false);

  const [userInput, setUserInput] = useState("");

  const { submitSurveyWithOutClosing, closeDialogWithPostHogDismiss } =
    usePosthogFeedbackSurvey({
      closeDialog,
      surveyName: "Report Content",
    });

  function close() {
    closeDialog();
    closeDialogWithPostHogDismiss();
  }

  async function onSubmit(e?: React.FormEvent<HTMLFormElement>) {
    log.info("submitting");
    e?.preventDefault();
    setUserHasSubmitted(true);
    submitSurveyWithOutClosing({
      //Messages Array
      $survey_response: messages ?? "No chat history",
      // Last Message Id
      $survey_response_1: messages
        ? messages[messages.length - 1]?.id
        : "No chat history",
      // Chat Id
      $survey_response_2: chatId,
      // Comment
      $survey_response_3: userInput,
    });
    setUserInput("");
  }

  return (
    <Flex className="h-full w-full" direction="column" justify="between">
      <form
        className="flex flex-col gap-14"
        onSubmit={async (e) => {
          e.preventDefault();
        }}
      >
        {userHasSubmitted ? (
          <>
            <OakP className="text-2xl">Thank you</OakP>
            <OakP>Your feedback has been submitted.</OakP>
            <OakFlex
              $width="100%"
              $justifyContent="flex-end"
              $gap="all-spacing-3"
            >
              <OakPrimaryButton onClick={() => closeDialog()}>
                Close
              </OakPrimaryButton>
            </OakFlex>
          </>
        ) : (
          <>
            <OakFlex $width="100%" $flexDirection="column" $gap="all-spacing-4">
              <OakP>Please provide details below.</OakP>
            </OakFlex>
            <OakTextInput
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              $minHeight="all-spacing-18"
            />

            <ModalFooterButtons
              actionButtonStates={() => (
                <OakPrimaryButton onClick={() => onSubmit()}>
                  Submit feedback
                </OakPrimaryButton>
              )}
              closeDialog={close}
            />
          </>
        )}
      </form>
    </Flex>
  );
};

export default ReportContentDialog;
