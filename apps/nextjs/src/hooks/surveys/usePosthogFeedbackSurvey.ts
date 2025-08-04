import { useCallback, useEffect, useState } from "react";

import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/react";
import type { Survey } from "posthog-js";
import { SurveyType } from "posthog-js";

import useAnalytics from "@/lib/analytics/useAnalytics";
import type { PostHogSurveyName } from "@/lib/posthog/surveys/surveysTypes.generated";

const log = aiLogger("feedback");

type UsePosthogFeedbackSurveyProps = {
  closeDialog?: () => void;
  surveyName: PostHogSurveyName;
};
export const usePosthogFeedbackSurvey = ({
  closeDialog,
  surveyName,
}: UsePosthogFeedbackSurveyProps) => {
  const [survey, setSurvey] = useState<Survey | undefined>(undefined);

  const { posthogAiBetaClient } = useAnalytics();

  useEffect(() => {
    posthogAiBetaClient.getSurveys((surveys) => {
      const filteredSurveys = surveys.filter(
        (survey) => survey.type === SurveyType.API,
      );

      const matchingSurvey = filteredSurveys.find(
        (survey) => survey.name === surveyName,
      );

      if (!matchingSurvey) {
        const error = new Error(`Survey with name ${surveyName} not found`);
        log.error(error);
        Sentry.captureException(error);

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
        const error = new Error(`Survey not found: ${surveyName}`);
        log.error(error);
        Sentry.captureException(error);
      }
      closeDialog?.();
    },
    [posthogAiBetaClient, closeDialog, survey, surveyName],
  );

  const submitSurveyWithOutClosing = useCallback(
    (data: Record<string, unknown>) => {
      if (survey) {
        posthogAiBetaClient.capture("survey sent", {
          $survey_id: survey.id,
          ...data,
        });
      } else {
        const error = new Error(`Survey not found: ${surveyName}`);
        log.error(error);
        Sentry.captureException(error);
      }
    },
    [posthogAiBetaClient, survey, surveyName],
  );

  return {
    survey,
    submitSurvey,
    submitSurveyWithOutClosing,
    closeDialogWithPostHogDismiss,
  };
};
