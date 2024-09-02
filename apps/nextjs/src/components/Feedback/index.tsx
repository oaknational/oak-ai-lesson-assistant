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
    { text: "Poor", number: 1 },
    { text: "Needs Improvement", number: 2 },
    { text: "Satisfactory", number: 3 },
    { text: "Good", number: 4 },
    { text: "Excellent", number: 5 },
  ];

  const [usersResponse, setUsersResponse] = useState<{ [key: string]: string }>(
    {},
  );

  if (!survey?.id) return null;

  return (
    <Flex
      className="hidden w-full overflow-y-scroll sm:h-full"
      direction="column"
      justify="start"
      align="start"
    >
      <p className="mb-20  text-3xl font-bold ">Before you continue...</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
        }}
        className="flex h-[700px] w-full flex-col gap-14"
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
                <label
                  htmlFor={question.question}
                  className="mb-16 text-left text-2xl font-bold"
                >
                  {question.question}
                </label>
                <div className="flex w-full flex-wrap justify-between gap-6">
                  {rating.map((feedback) => {
                    return (
                      <button
                        key={feedback.text}
                        className={`flex flex-col items-center justify-center gap-6`}
                        onClick={() => {
                          setUsersResponse((prevState) => ({
                            ...prevState,
                            [surveyResponseKey]: feedback.number.toString(),
                          }));
                        }}
                      >
                        <span
                          className={`text-lg ${
                            usersResponse[surveyResponseKey] ===
                            feedback.number.toString()
                              ? `text-[#287C34]`
                              : `text-black`
                          }`}
                        >
                          {feedback.text}
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
