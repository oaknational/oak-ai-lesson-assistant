import { useState } from "react";

import {
  OakBox,
  OakFlex,
  OakIcon,
  OakP,
  OakPrimaryButton,
  OakSecondaryLink,
  OakTextInput,
} from "@oaknational/oak-components";

interface TeachingMaterialsModerationFeedbackProps {
  closeDialog: () => void;
  resetToDefault?: () => void;
  heading: string;
  message: React.ReactNode;
  submitSurvey: (feedback: string) => void;
  backButtonLabel: string;
  onBack: () => void;
}

const TeachingMaterialsModerationFeedback = ({
  closeDialog,
  resetToDefault,
  heading,
  message,
  submitSurvey,
  backButtonLabel,
  onBack,
}: TeachingMaterialsModerationFeedbackProps) => {
  const [feedback, setFeedback] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  if (submittedFeedback) {
    return (
      <OakFlex
        $width="100%"
        $height="100%"
        $flexDirection="column"
        $justifyContent="space-between"
        $gap={"spacing-24"}
      >
        <OakP $font={"heading-6"}>{"Thank you"}</OakP>
        <OakP>Your feedback has been submitted.</OakP>
        <OakFlex $justifyContent={"flex-end"}>
          <OakPrimaryButton
            onClick={() => {
              if (resetToDefault) resetToDefault();
              closeDialog();
            }}
          >
            {backButtonLabel}
          </OakPrimaryButton>
        </OakFlex>
      </OakFlex>
    );
  }

  return (
    <OakFlex
      $width="100%"
      $height="100%"
      $flexDirection="column"
      $justifyContent="space-between"
      $gap={"spacing-24"}
    >
      <OakBox $display={["none", "flex"]}>
        <OakIcon iconName={"warning"} />
      </OakBox>
      <OakP $font={"heading-6"}>{heading}</OakP>
      <OakP $font="body-2">{message}</OakP>
      <OakTextInput
        value={feedback}
        $minHeight={"spacing-64"}
        placeholder="Your feedback"
        onChange={(e) => setFeedback(e.target.value)}
      />
      <OakFlex
        $flexDirection={"row"}
        $alignItems={"center"}
        $justifyContent="space-between"
      >
        <OakSecondaryLink
          element="button"
          onClick={() => {
            if (resetToDefault) resetToDefault();
            onBack();
          }}
        >
          {backButtonLabel}
        </OakSecondaryLink>
        <OakBox $display={["none", "flex"]}>
          <OakPrimaryButton
            onClick={() => {
              submitSurvey(feedback);
              setSubmittedFeedback(true);
            }}
          >
            Submit feedback
          </OakPrimaryButton>
        </OakBox>
        <OakBox $display={["flex", "none"]}>
          <OakPrimaryButton
            $display={["flex", "none"]}
            onClick={() => {
              submitSurvey(feedback);
              setSubmittedFeedback(true);
            }}
          >
            Submit
          </OakPrimaryButton>
        </OakBox>
      </OakFlex>
    </OakFlex>
  );
};

export default TeachingMaterialsModerationFeedback;
