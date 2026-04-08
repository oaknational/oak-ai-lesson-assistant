import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import type { ModerationResult } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import {
  getSafetyResult,
  isHighlySensitive,
  isToxic,
} from "@oakai/core/src/utils/ailaModeration/safetyResult";

import { OakModalCenter } from "@oaknational/oak-components";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import invariant from "tiny-invariant";

import { lockingModerationModalTextMap } from "@/components/AppComponents/Chat/Chat/ChatModerationDisplay";
import { LockingModerationModalContent } from "@/components/AppComponents/Moderation/LockingModerationModalContent";
import { usePosthogFeedbackSurvey } from "@/hooks/surveys/usePosthogFeedbackSurvey";
import {
  useTeachingMaterialsActions,
  useTeachingMaterialsStore,
} from "@/stores/TeachingMaterialsStoreProvider";
import {
  moderationSelector,
  pageDataSelector,
} from "@/stores/teachingMaterialsStore/selectors";

type TeachingMaterialsLockingModerationModalProps = {
  moderation: ModerationResult | undefined;
};

export function TeachingMaterialsLockingModerationModal({
  moderation,
}: TeachingMaterialsLockingModerationModalProps) {
  const router = useRouter();
  const { resetToDefault } = useTeachingMaterialsActions();
  const storeModeration = useTeachingMaterialsStore(moderationSelector);
  const id = useTeachingMaterialsStore(pageDataSelector).lessonPlan.lessonId;

  if (!moderation || (!isToxic(moderation) && !isHighlySensitive(moderation))) {
    return null;
  }

  invariant(storeModeration, "Moderation data is required for this component");

  const modalText = lockingModerationModalTextMap[getSafetyResult(moderation)];

  const { heading, body } = modalText;

  const handleClose = () => {
    resetToDefault();
    router.push("/aila");
  };

  return (
    <TeachingMaterialsLockingModerationModalInner
      open
      onClose={handleClose}
      heading={heading}
      body={body}
      moderation={storeModeration}
      id={id}
    />
  );
}

type InnerProps = Readonly<{
  open: boolean;
  onClose: () => void;
  heading: string;
  body: string;
  moderation: ModerationResult;
  id: string | undefined;
}>;

function TeachingMaterialsLockingModerationModalInner({
  open,
  onClose,
  heading,
  body,
  moderation,
  id,
}: InnerProps) {
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

  return (
    <OakModalCenter isOpen={open} onClose={onClose}>
      <LockingModerationModalContent
        onClose={onClose}
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
