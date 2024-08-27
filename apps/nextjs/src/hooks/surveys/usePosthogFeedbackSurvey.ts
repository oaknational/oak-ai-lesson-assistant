import { useEffect, useState, useCallback } from "react";

import * as Sentry from "@sentry/react";
import { Survey } from "posthog-js";
import { usePostHog } from "posthog-js/react";

type UsePosthogFeedbackSurveyProps = {
  closeDialog?: () => void;
  surveyName:
    | "Chat Feedback"
    | "Moderation feedback"
    | "Chat Feedback With Stats"
    | "Report Content";
};
export const usePosthogFeedbackSurvey = ({
  closeDialog,
  surveyName,
}: UsePosthogFeedbackSurveyProps) => {
  const [survey, setSurvey] = useState<Survey | undefined>(undefined);

  const posthog = usePostHog();
  useEffect(() => {
    posthog.getSurveys((surveys) => {
      const filteredSurveys = surveys.filter((survey) => survey.type === "api");
      const matchingSurvey = filteredSurveys.find(
        (survey) => survey.name === surveyName,
      );

      if (!matchingSurvey) {
        Sentry.captureException(
          new Error(`Survey with name ${surveyName} not found`),
        );

        return;
      }

      setSurvey(matchingSurvey);

      posthog.capture("survey shown", {
        $survey_id: matchingSurvey.id,
      });
    }, true);
  }, [posthog, setSurvey, surveyName]);

  const closeDialogWithPostHogDismiss = useCallback(() => {
    if (survey) {
      posthog.capture("survey dismissed", {
        survey_id: survey.id,
      });
    }
    closeDialog?.();
  }, [posthog, closeDialog, survey]);

  const submitSurvey = useCallback(
    (data: Record<string, unknown>) => {
      if (survey) {
        posthog.capture("survey sent", {
          $survey_id: survey.id,
          ...data,
        });
      } else {
        Sentry.captureException(new Error("Survey not found"));
      }
      closeDialog?.();
    },
    [posthog, closeDialog, survey],
  );

  const submitSurveyWithOutClosing = useCallback(
    (data: Record<string, unknown>) => {
      if (survey) {
        posthog.capture("survey sent", {
          $survey_id: survey.id,
          ...data,
        });
      } else {
        Sentry.captureException(new Error("Survey not found"));
      }
    },
    [posthog, survey],
  );

  return {
    survey,
    submitSurvey,
    submitSurveyWithOutClosing,
    closeDialogWithPostHogDismiss,
  };
};
