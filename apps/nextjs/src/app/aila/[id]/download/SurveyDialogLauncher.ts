import { useEffect } from "react";

import { useDialog } from "@/components/AppComponents/DialogContext";
import { usePosthogFeedbackSurvey } from "@/hooks/surveys/usePosthogFeedbackSurvey";

export function SurveyDialogLauncher() {
  const { survey } = usePosthogFeedbackSurvey({
    closeDialog: () => null,
    surveyName: "End of Aila generation survey launch aug24",
  });
  const { setDialogWindow } = useDialog();

  useEffect(() => {
    if (survey) {
      const timer = setTimeout(() => {
        setDialogWindow("feedback");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [survey, setDialogWindow]);

  return null;
}
