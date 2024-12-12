import { useRef, useState } from "react";

import { OakPrimaryButton } from "@oaknational/oak-components";
import { Flex } from "@radix-ui/themes";
import type { Survey } from "posthog-js";
import { SurveyQuestionType } from "posthog-js";

import { Icon } from "../Icon";

export type FeedBackProps = Readonly<{
  submitSurvey: (usersResponse: { [key: string]: string }) => void;
  survey: Survey;
  onSubmit: () => void;
  closeDialogWithPostHogDismiss: () => void;
}>;
const FeedBack = ({
  submitSurvey,
  survey,
  onSubmit,
  closeDialogWithPostHogDismiss,
}: FeedBackProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
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
      justify="center"
      align="center"
    >
      {/* Close Button */}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
        }}
        className="flex w-full flex-col gap-14"
      >
        <button
          ref={closeButtonRef}
          onClick={closeDialogWithPostHogDismiss}
          tabIndex={0}
          className="absolute right-7 top-7 h-20 w-20"
        />

        {survey?.questions.map((question, i) => {
          const surveyResponseKey =
            i === 0 ? "$survey_response" : `$survey_response_${i}`;
          if (question.type === SurveyQuestionType.Rating) {
            return (
              <div
                key={question.question}
                className="flex flex-col items-center justify-center"
              >
                <span className="mb-7 flex flex-col items-center justify-center gap-0 text-center">
                  <label
                    htmlFor={question.question}
                    className="text-center text-2xl font-bold"
                  >
                    {question.question}
                  </label>
                  <p className="mt-6 text-center opacity-90">
                    {i === 0
                      ? "1=Poor, 5=Excellent"
                      : "1=Very difficult, 5=Very easy"}
                  </p>
                </span>
                <div className="mt-7 flex w-full justify-center gap-5">
                  {rating.map((feedback) => (
                    <button
                      key={feedback.number}
                      className={
                        "flex flex-col items-center justify-center gap-6"
                      }
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
                            ? "border-black bg-black text-white"
                            : " border-oakGrey3 bg-white text-black"
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
                  ))}
                </div>
              </div>
            );
          }
          if (question.type === SurveyQuestionType.Open) {
            return (
              <div
                key={question.question}
                className="flex flex-col items-start justify-start"
              >
                <label
                  htmlFor={question.question}
                  className="mb-16 text-center text-2xl font-bold"
                >
                  {question.question}
                </label>
                <textarea
                  tabIndex={1}
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
        <div className="flex justify-center">
          <OakPrimaryButton
            tabIndex={1}
            onClick={() => {
              submitSurvey(usersResponse);
              onSubmit();
            }}
          >
            Send feedback
          </OakPrimaryButton>
        </div>
      </form>
    </Flex>
  );
};

export default FeedBack;
