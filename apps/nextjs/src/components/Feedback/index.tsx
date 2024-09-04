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
  submitSurvey: (usersResponse: { [key: string]: string }) => void;
  closeDialogWithPostHogDismiss: () => void;
  onSubmit: () => void;
}) => {
  const rating = [
    { number: 1 },
    { number: 2 },
    { number: 3 },
    { number: 4 },
    { number: 5 },
  ];

  const [usersResponse, setUsersResponse] = useState<{ [key: string]: string }>(
    {},
  );

  if (!survey?.id) return null;

  return (
    <Flex
      className="h-full w-full"
      direction="column"
      justify="start"
      align="start"
    >
      <p className="mb-20 text-3xl font-bold">Before you continue...</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
        }}
        className="flex w-full flex-col gap-14"
      >
        {survey?.questions.map((question, i) => {
          // first survey key should be $survey_response
          // see https://posthog.com/docs/surveys/implementing-custom-surveys under Capturing multiple responses
          const surveyResponseKey =
            i === 0 ? `$survey_response` : `$survey_response_${i}`;
          if (question.type === "rating") {
            return (
              <div
                key={question.question}
                className="flex flex-col items-start justify-start"
              >
                <span className="mb-7">
                  <label
                    htmlFor={question.question}
                    className="mb-16 text-left text-2xl font-bold"
                  >
                    {question.question}
                  </label>
                  <p className="mt-6 opacity-90">1=Poor, 5=Excellent</p>
                </span>
                <div className="mt-7 flex w-full justify-start gap-5">
                  {rating.map((feedback) => {
                    return (
                      <button
                        key={feedback.number}
                        className={`flex flex-col items-center justify-center gap-6`}
                        onClick={() => {
                          setUsersResponse((prevState) => ({
                            ...prevState,
                            [surveyResponseKey]: feedback.number.toString(),
                          }));
                        }}
                      >
                        <span
                          className={`rounded-sm border-2  p-8 px-9 text-lg sm:px-15 ${
                            usersResponse[surveyResponseKey] ===
                            feedback.number.toString()
                              ? `border-black bg-black text-white`
                              : ` border-oakGrey3 bg-white text-black`
                          }`}
                        >
                          {feedback.number}
                        </span>
                        <span
                          className={
                            usersResponse[surveyResponseKey] ===
                            feedback.number.toString()
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
          if (question.type === "open") {
            return (
              <div
                key={question.question}
                className="flex flex-col items-start justify-start"
              >
                <label
                  htmlFor={question.question}
                  className="mb-16 text-left text-2xl font-bold"
                >
                  {question.question}
                </label>
                <textarea
                  className="h-32 w-full min-w-[300px] rounded border-2 border-black p-10"
                  onChange={(e) => {
                    setUsersResponse({
                      ...usersResponse,
                      [surveyResponseKey]: e.target.value,
                    });
                  }}
                  id={question.question}
                />
              </div>
            );
          }
        })}
        <div className="flex justify-between">
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
