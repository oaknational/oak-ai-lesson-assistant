import { useState } from "react";

import { Flex } from "@radix-ui/themes";
import { Message } from "ai";
import { usePosthogFeedbackSurvey } from "hooks/surveys/usePosthogFeedbackSurvey";

import ChatButton from "@/components/AppComponents/Chat/ui/chat-button";
import { Icon } from "@/components/Icon";

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
    console.log("submitting");
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
        <Icon icon="warning" size="lg" />
        {userHasSubmitted ? (
          <>
            <p className="text-2xl">Thank you</p>
            <p>Your feedback has been submitted.</p>
            <div className=" flex w-full justify-end gap-7">
              <ChatButton variant="primary" onClick={() => closeDialog()}>
                Close
              </ChatButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex w-full flex-col gap-9">
              <p className="text-2xl font-semibold">Report content</p>
              <p className="">Please provide details below.</p>
            </div>
            <textarea
              className="h-40 w-full resize-none rounded-sm border-2 border-black border-opacity-60 p-16 focus:rounded-none"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />

            <div className="flex w-full justify-between gap-7">
              <ChatButton variant="secondary" onClick={() => close()}>
                Back
              </ChatButton>
              <ChatButton variant="primary" onClick={() => onSubmit()}>
                Submit feedback
              </ChatButton>
            </div>
          </>
        )}
      </form>
    </Flex>
  );
};

export default ReportContentDialog;
