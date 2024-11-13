import { useState } from "react";

import {
  OakBox,
  OakFlex,
  OakGrid,
  OakIcon,
  OakLabel,
  OakP,
  OakPrimaryButton,
  OakSecondaryButton,
  OakSpan,
  OakTextInput,
} from "@oaknational/oak-components";
import { Flex } from "@radix-ui/themes";
import type { Survey } from "posthog-js";

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
            i === 0 ? "$survey_response" : `$survey_response_${i}`;
          if (question.type === "rating") {
            return (
              <OakFlex
                key={question.question}
                className="flex flex-col items-start justify-start"
                $width="100%"
                $flexDirection="column"
                $alignItems="flex-start"
                $justifyContent="flex-start"
              >
                <OakSpan className="mb-7">
                  <OakBox $mb="space-between-s">
                    <OakLabel htmlFor={question.question} $font="heading-5">
                      {question.question}
                    </OakLabel>
                  </OakBox>
                  <OakP className="mt-6 opacity-90">1=Poor, 5=Excellent</OakP>
                </OakSpan>
                <OakFlex
                  $justifyContent="flex-start"
                  $gap="space-between-ssx"
                  $width="100%"
                  $mt="space-between-s"
                >
                  {rating.map((feedback) => {
                    return (
                      <button
                        key={feedback.number}
                        onClick={() => {
                          setUsersResponse((prevState) => ({
                            ...prevState,
                            [surveyResponseKey]: feedback.number.toString(),
                          }));
                        }}
                      >
                        <OakFlex
                          $flexDirection="column"
                          $gap="space-between-s"
                          $justifyContent="center"
                          $alignItems="center"
                        >
                          <OakSpan
                            $borderRadius="border-radius-s"
                            $ba="border-solid-m"
                            $borderStyle="solid"
                            $pa="inner-padding-s"
                            $ph="inner-padding-l"
                            $borderColor={
                              usersResponse[surveyResponseKey] ===
                              feedback.number.toString()
                                ? "black"
                                : "grey80"
                            }
                            $background={
                              usersResponse[surveyResponseKey] ===
                              feedback.number.toString()
                                ? "black"
                                : "white"
                            }
                            $color={
                              usersResponse[surveyResponseKey] ===
                              feedback.number.toString()
                                ? "white"
                                : "black"
                            }
                          >
                            {feedback.number}
                          </OakSpan>
                          <OakSpan
                            $opacity={
                              usersResponse[surveyResponseKey] ===
                              feedback.number.toString()
                                ? "opaque"
                                : "transparent"
                            }
                          >
                            <OakIcon iconName="tick" />
                          </OakSpan>
                        </OakFlex>
                      </button>
                    );
                  })}
                </OakFlex>
              </OakFlex>
            );
          }
          if (question.type === "open") {
            return (
              <OakFlex
                $flexDirection="column"
                $alignItems="flex-start"
                $justifyContent="flex-start"
                key={question.question}
                $width="100%"
              >
                <OakBox $mb="space-between-s">
                  <OakLabel htmlFor={question.question} $font="heading-5">
                    {question.question}
                  </OakLabel>
                </OakBox>
                <OakGrid $gridTemplateColumns="repeat(1, 1fr)" $width="100%">
                  <textarea
                    className="min-h-34 w-full resize-none rounded-md border-2 border-grey10 p-12"
                    onChange={(e) => {
                      setUsersResponse({
                        ...usersResponse,
                        [surveyResponseKey]: e.target.value,
                      });
                    }}
                    id={question.question}
                  />
                </OakGrid>
              </OakFlex>
            );
          }
        })}
        <OakFlex $justifyContent="space-between">
          <OakSecondaryButton onClick={() => closeDialogWithPostHogDismiss()}>
            Skip
          </OakSecondaryButton>
          <OakPrimaryButton
            onClick={() => {
              submitSurvey(usersResponse);
              onSubmit();
            }}
          >
            Submit feedback
          </OakPrimaryButton>
        </OakFlex>
      </form>
    </Flex>
  );
};

export default FeedBack;
