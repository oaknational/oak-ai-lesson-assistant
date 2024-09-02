import { useEffect } from "react";

import { usePosthogFeedbackSurvey } from "hooks/surveys/usePosthogFeedbackSurvey";

import { useDialog } from "@/components/AppComponents/DialogContext";

export function SurveyDialogLauncher() {
  const { survey } = usePosthogFeedbackSurvey({
    closeDialog: () => null,
    surveyName: "End of Aila generation survey launch aug24",
  });
  const { setDialogWindow } = useDialog();

  useEffect(() => {
    if (survey) {
      const timer = setTimeout(() => {
        if (window.innerWidth < 768) {
          setDialogWindow("");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [survey, setDialogWindow]);

  return null;
}
