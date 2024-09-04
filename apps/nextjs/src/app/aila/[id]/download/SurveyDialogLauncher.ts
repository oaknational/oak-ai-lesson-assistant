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
    console.log("survey", survey);
    if (survey) {
      const timer = setTimeout(() => {
        console.log("this fired");
        setDialogWindow("feedback");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [survey, setDialogWindow]);

  return null;
}
