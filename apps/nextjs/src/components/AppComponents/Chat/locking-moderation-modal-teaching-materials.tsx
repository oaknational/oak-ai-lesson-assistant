import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import { getSafetyResult } from "@oakai/core/src/utils/ailaModeration/safetyResult";

import { OakModalCenter } from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";
import invariant from "tiny-invariant";

import { usePosthogFeedbackSurvey } from "@/hooks/surveys/usePosthogFeedbackSurvey";
import {
  useTeachingMaterialsActions,
  useTeachingMaterialsStore,
} from "@/stores/TeachingMaterialsStoreProvider";
import {
  moderationSelector,
  pageDataSelector,
} from "@/stores/teachingMaterialsStore/selectors";

import { LockingModerationModalContent } from "./locking-moderation-modal-content";

type LockingModerationModalTeachingMaterialsProps = Readonly<{
  open: boolean;
  onClose: () => void;
  heading: string;
  body: string;
}>;

export function LockingModerationModalTeachingMaterials({
  open,
  onClose,
  heading,
  body,
}: LockingModerationModalTeachingMaterialsProps) {
  const { resetToDefault } = useTeachingMaterialsActions();
  const moderation = useTeachingMaterialsStore(moderationSelector);
  const id = useTeachingMaterialsStore(pageDataSelector).lessonPlan.lessonId;
  invariant(moderation, "Moderation data is required for this component");

  const { submitSurveyWithOutClosing } = usePosthogFeedbackSurvey({
    surveyName: "Moderation feedback",
  });

  const [showFeedback, setShowFeedback] = useState(false);
  const [comment, setComment] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isValid = comment.trim().length > 0;

  const handleSubmit = useCallback(() => {
    try {
      submitSurveyWithOutClosing({
        $survey_response: getSafetyResult(moderation),
        $survey_response_1: moderation.categories,
        $survey_response_2: null,
        $survey_response_3: id,
        $survey_response_4: comment,
        $survey_response_5: "teaching-materials",
      });
      setHasSubmitted(true);
    } catch (error) {
      toast.error("Failed to submit feedback");
      Sentry.captureException(error);
    }
  }, [submitSurveyWithOutClosing, moderation, id, comment]);

  const handleClose = useCallback(() => {
    resetToDefault();
    onClose();
  }, [resetToDefault, onClose]);

  return (
    <OakModalCenter isOpen={open} onClose={handleClose}>
      <LockingModerationModalContent
        onClose={handleClose}
        heading={heading}
        body={body}
        showFeedback={showFeedback}
        setShowFeedback={setShowFeedback}
        comment={comment}
        setComment={setComment}
        hasSubmitted={hasSubmitted}
        isValid={isValid}
        handleSubmit={handleSubmit}
        isLoading={false}
      />
    </OakModalCenter>
  );
}
