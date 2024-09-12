import { useEffect, useState, useCallback } from "react";

import * as Sentry from "@sentry/react";
import { Survey } from "posthog-js";

import useAnalytics from "@/lib/analytics/useAnalytics";

type UsePosthogFeedbackSurveyProps = {
  closeDialog?: () => void;
  surveyName:
    | "Chat Feedback"
    | "Moderation feedback"
    | "Chat Feedback With Stats"
    | "Report Content"
    | "End of Aila generation survey launch aug24";
};
export const usePosthogFeedbackSurvey = ({
  closeDialog,
  surveyName,
}: UsePosthogFeedbackSurveyProps) => {
  const [survey, setSurvey] = useState<Survey | undefined>(undefined);

  const { posthogAiBetaClient } = useAnalytics();

  useEffect(() => {
    posthogAiBetaClient.getSurveys((surveys) => {
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

      posthogAiBetaClient.capture("survey shown", {
        $survey_id: matchingSurvey.id,
      });
    }, true);
  }, [posthogAiBetaClient, setSurvey, surveyName]);

  const closeDialogWithPostHogDismiss = useCallback(() => {
    if (survey) {
      posthogAiBetaClient.capture("survey dismissed", {
        survey_id: survey.id,
      });
    }
    closeDialog?.();
  }, [posthogAiBetaClient, closeDialog, survey]);

  const submitSurvey = useCallback(
    (data: Record<string, unknown>) => {
      if (survey) {
        posthogAiBetaClient.capture("survey sent", {
          $survey_id: survey.id,
          ...data,
        });
      } else {
        Sentry.captureException(new Error("Survey not found"));
      }
      closeDialog?.();
    },
    [posthogAiBetaClient, closeDialog, survey],
  );

  const submitSurveyWithOutClosing = useCallback(
    (data: Record<string, unknown>) => {
      if (survey) {
        posthogAiBetaClient.capture("survey sent", {
          $survey_id: survey.id,
          ...data,
        });
      } else {
        Sentry.captureException(new Error("Survey not found"));
      }
    },
    [posthogAiBetaClient, survey],
  );

  return {
    survey,
    submitSurvey,
    submitSurveyWithOutClosing,
    closeDialogWithPostHogDismiss,
  };
};
