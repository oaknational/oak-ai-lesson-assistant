import type { ExportableQuizAppState } from "@oakai/exports/src/schema/input.schema";
import { convertToGIFTFormat } from "ai-apps/quiz-designer/convertToGIFTFormat";

import useAnalytics from "@/lib/analytics/useAnalytics";

import Button from "../../Button";

type DownloadGiftButtonProps = {
  quizData: Readonly<ExportableQuizAppState>;
};

function DownloadGiftButton({ quizData }: Readonly<DownloadGiftButtonProps>) {
  const generateGiftText = () => {
    const giftText = convertToGIFTFormat(quizData);

    // Create a Blob containing the GIFT text
    const blob = new Blob([giftText], { type: "text/plain" });

    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz.txt"; // Specify the filename here
    a.style.display = "none";

    // Append the anchor to the document body and trigger a click event
    document.body.appendChild(a);
    a.click();

    // Remove the anchor element and revoke the URL
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  const { trackEvent } = useAnalytics();
  return (
    <Button
      variant="text-link"
      onClick={() => {
        generateGiftText();
        trackEvent("quiz_designer:click_export", {
          export_type: "gift",
        });
      }}
      icon="download"
    >
      GIFT
    </Button>
  );
}

export default DownloadGiftButton;
