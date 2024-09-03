import { useEffect } from "react";

import { usePosthogFeedbackSurvey } from "hooks/surveys/usePosthogFeedbackSurvey";

import { useDialog } from "@/components/AppComponents/DialogContext";
import { mobileWidth } from "@/utils/mobileWidth";

export function SurveyDialogLauncher() {
  const { survey } = usePosthogFeedbackSurvey({
    closeDialog: () => null,
    surveyName: "End of Aila generation survey launch aug24",
  });
  const { setDialogWindow } = useDialog();

  useEffect(() => {
    setDialogWindow("feedback");
    if (survey) {
      const timer = setTimeout(() => {
        setDialogWindow("feedback");
        if (window.innerWidth < mobileWidth) {
          setDialogWindow("");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [survey, setDialogWindow]);

  return null;
}
