import { useEffect, useState } from "react";

import { getSafetyResult } from "@oakai/core/src/utils/ailaModeration/helpers";
import { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { trpc } from "@/utils/trpc";

import { usePosthogFeedbackSurvey } from "./usePosthogFeedbackSurvey";

export const useModerationFeedbackSurvey = ({
  chatId,
  moderation,
}: {
  chatId: string;
  moderation: PersistedModerationBase;
}) => {
  const feedbackQuery = trpc.moderations.userComment.useMutation();
  const moderationRecord = trpc.moderations.moderationById.useQuery(
    moderation.id,
  );
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (moderationRecord.data) {
      setComment(moderationRecord.data.userComment || "");
    }
  }, [moderationRecord.data]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { submitSurvey } = usePosthogFeedbackSurvey({
    surveyName: "Moderation feedback",
  });

  const isValid = comment.trim().length > 0;

  async function onSubmit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (!isValid) {
      return;
    }

    feedbackQuery.mutate({
      moderationId: moderation.id,
      comment,
    });
    submitSurvey({
      $survey_response: getSafetyResult(moderation),
      $survey_response_1: moderation.categories,
      $survey_response_2: moderation.id,
      $survey_response_3: chatId,
      $survey_response_4: comment,
    });
    setComment("");
    setHasSubmitted(true);
  }

  return {
    onSubmit,
    isValid,
    comment,
    setComment,
    hasSubmitted,
    setHasSubmitted,
  };
};
