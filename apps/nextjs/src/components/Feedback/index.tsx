import { useState } from "react";

import { Flex } from "@radix-ui/themes";
import { Survey } from "posthog-js";

import ChatButton from "../AppComponents/Chat/ui/chat-button";
import { Icon } from "../Icon";

const FeedBack = ({
  submitSurvey,
  survey,
  onSubmit,
  closeDialogWithPostHogDismiss,
}: {
  survey: Survey;
  submitSurvey: (usersResponse: {
    $survey_response: string;
    $survey_response_1: string;
    $survey_response_2: string;
  }) => void;
  closeDialogWithPostHogDismiss: () => void;
  onSubmit: () => void;
}) => {
  const numbersOfHoursSaved = [0, 1, 2, 3, 4, 5, 6];
  const [usersResponse, setUsersResponse] = useState({
    $survey_response: "",
    $survey_response_1: "",
    $survey_response_2: "",
  });

  if (!survey?.id) return null;
  return (
    <Flex
      className="h-full w-full"
      direction="column"
      justify="start"
      align="start"
    >
      <p className="mb-20 text-3xl  font-bold">Before you continue...</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
        }}
        className="flex w-full flex-col gap-14"
      >
        {survey?.questions.map((question) => {
          if (question.type === "open") {
            return (
              <div
                key={question.question}
                className="flex flex-col items-start justify-start"
              >
                <label
                  htmlFor={question.question}
                  className="mb-16 text-center text-xl "
                >
                  {question.question}
                </label>
                <textarea
                  className="h-32 w-full min-w-[300px] rounded border-2 border-black p-10"
                  onChange={(e) => {
                    setUsersResponse({
                      ...usersResponse,
                      $survey_response_1: e.target.value,
                    });
                  }}
                  id={question.question}
                />
              </div>
            );
          }
          if (question.type === "rating") {
            return (
              <div
                key={question.question}
                className="flex flex-col items-start justify-start"
              >
                <label
                  htmlFor={question.question}
                  className="mb-16 text-left text-xl "
                >
                  {question.question}
                </label>
                <div className="flex w-full justify-between gap-6">
                  {numbersOfHoursSaved.map((number) => {
                    return (
                      <button
                        key={number}
                        className={`flex flex-col items-center justify-center gap-6 `}
                        onClick={() => {
                          setUsersResponse({
                            ...usersResponse,
                            $survey_response: number.toString(),
                          });
                        }}
                      >
                        <span
                          className={`text-2xl font-bold ${usersResponse.$survey_response === number.toString() ? `text-[#287C34]` : `text-black`}`}
                        >
                          {number}
                          {number === numbersOfHoursSaved.length - 1 ? "+" : ""}
                        </span>
                        <span
                          className={
                            usersResponse.$survey_response === number.toString()
                              ? "opacity-100"
                              : "opacity-0"
                          }
                        >
                          <Icon icon="tick" size="sm" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }
        })}
        <div className="flex justify-between ">
          <ChatButton
            variant="text-link"
            onClick={() => closeDialogWithPostHogDismiss()}
          >
            Skip
          </ChatButton>
          <ChatButton
            variant="primary"
            onClick={() => {
              submitSurvey(usersResponse);
              onSubmit();
            }}
          >
            Submit feedback
          </ChatButton>
        </div>
      </form>
    </Flex>
  );
};

export default FeedBack;
