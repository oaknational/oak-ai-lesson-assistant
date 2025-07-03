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

interface AdditionalMaterialsModerationFeedbackProps {
  closeDialog: () => void;
  resetToDefault?: () => void;
  heading: string;
  message: React.ReactNode;
  submitSurvey: (feedback: string) => void;
  backButtonLabel: string;
  onBack: () => void;
}

const AdditionalMaterialsModerationFeedback = ({
  closeDialog,
  resetToDefault,
  heading,
  message,
  submitSurvey,
  backButtonLabel,
  onBack,
}: AdditionalMaterialsModerationFeedbackProps) => {
  const [feedback, setFeedback] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  if (submittedFeedback) {
    return (
      <OakFlex
        $width="100%"
        $height="100%"
        $flexDirection="column"
        $justifyContent="space-between"
        $gap={"space-between-m"}
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
      $gap={"space-between-m"}
    >
      <OakBox $display={["none", "flex"]}>
        <OakIcon iconName={"warning"} />
      </OakBox>
      <OakP $font={"heading-6"}>{heading}</OakP>
      <OakP $font="body-2">{message}</OakP>
      <OakTextInput
        value={feedback}
        $minHeight={"all-spacing-11"}
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

export default AdditionalMaterialsModerationFeedback;
