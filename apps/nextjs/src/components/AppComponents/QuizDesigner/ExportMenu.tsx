import { useMemo } from "react";

import { Box, Flex, Heading, Text } from "@radix-ui/themes";

import { convertQuizToCSV } from "@/ai-apps/quiz-designer/convertToCSV";
import { makeExportable } from "@/ai-apps/quiz-designer/export-helpers";
import type { QuizAppState } from "@/ai-apps/quiz-designer/state/types";
import Button from "@/components/Button";
import ExportMenuWrap from "@/components/ExportMenuWrap";
import { useExportQuizDesignerSlides } from "@/components/ExportsDialogs/useExportQuizDesignerSlides";
import LoadingWheel from "@/components/LoadingWheel";
import useShareContent from "@/hooks/useShareContent";
import useAnalytics from "@/lib/analytics/useAnalytics";

import ChatButton from "../Chat/ui/chat-button";
import ShareButtonGroup from "../common/ShareButtonGroup";
import DownloadGiftButton from "./DownloadGiftButton";

interface ExportMenuProps {
  quizData: QuizAppState;
  isOpen: boolean;
  toggleIsOpen: () => void;
}

const ExportMenu = ({
  quizData,
  isOpen,
  toggleIsOpen,
}: Readonly<ExportMenuProps>) => {
  const { keyStage, subject } = quizData;

  // @TODO: We should only calculate this when it changes
  const exportableQuizData = useMemo(
    () => makeExportable(quizData),
    [quizData],
  );

  const handleCSVDownload = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      encodeURI(convertQuizToCSV(exportableQuizData));
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", csvContent);
    downloadLink.setAttribute("download", "quizData.csv");
    downloadLink.click();
  };

  const quizSlidesExport = useExportQuizDesignerSlides({
    onStart: () => null,
    quiz: exportableQuizData,
    quizId: quizData.sessionId ?? "",
    active: true,
  });
  const data = quizSlidesExport.data;

  const link = data && "link" in data ? data.link : "";
  const hasError = data && "message" in data;
  const errorMessage = data && "message" in data ? data.message : "";
  const fileId =
    data && "link" in data && data.link?.split("/edit")[0]?.split("/d/")[1];
  const { trackEvent } = useAnalytics();

  const { shareContent, shareId, shareLoading } = useShareContent({
    state: quizData,
  });

  return (
    <ExportMenuWrap
      isOpen={isOpen}
      toggleIsOpen={toggleIsOpen}
      keyStage={keyStage}
      subject={subject}
      appSlug="quiz-generator"
    >
      {subject && keyStage && (
        <>
          <Box mb="9">
            <Heading mb="2">Slides</Heading>
            <Text>
              This PowerPoint has been auto-generated, meaning the layout,
              punctuation and grammar may be incorrect and should be double
              checked by a teacher before being used in the classroom.
            </Text>
            <Box mt="5">
              {quizSlidesExport.data && link && (
                <div className="flex gap-5">
                  <ChatButton
                    variant="primary"
                    icon="external"
                    href={link}
                    target="_blank"
                  >
                    Go to your slides
                  </ChatButton>
                  <ChatButton
                    variant="primary"
                    href={`/api/qd-download?fileId=${fileId}&ext=pptx`}
                    icon="download"
                    target="_blank"
                  >
                    Download PPTX
                  </ChatButton>
                </div>
              )}
              {quizSlidesExport.status === "loading" && (
                <div className="flex items-center gap-5">
                  <LoadingWheel /> <span>Generating</span>
                </div>
              )}
              {hasError && <Text>{errorMessage}</Text>}
              {quizSlidesExport.readyToExport &&
                !quizSlidesExport.data &&
                quizSlidesExport.status !== "loading" && (
                  <ChatButton
                    variant="primary"
                    onClick={() => {
                      quizSlidesExport.start();
                      trackEvent("quiz_designer:click_export", {
                        export_type: "powerpoint",
                      });
                    }}
                    icon="download"
                  >
                    Create PPTX of your quiz
                  </ChatButton>
                )}
            </Box>
          </Box>

          <Box mb="9">
            <Heading mb="2">View as text</Heading>
            <Text>View quiz as text and copy to clipboard.</Text>
            <Box mt="5">
              <ShareButtonGroup
                loading={shareLoading}
                shareContent={shareContent}
                shareId={shareId}
                shareText="View as text"
                app="quiz-designer"
              />
            </Box>
          </Box>
          <Box className="">
            <Heading mb="2" size="5" className="mt-20">
              Other options
            </Heading>
            <Box>
              <Text>
                CSV & GIFT format can be used to uploaded to many popular
                platforms.
              </Text>
              <Flex mt="5" gap="6">
                <Button
                  variant="text-link"
                  icon="download"
                  onClick={() => {
                    handleCSVDownload();
                    trackEvent("quiz_designer:click_export", {
                      export_type: "csv",
                    });
                  }}
                >
                  CSV
                </Button>
                <DownloadGiftButton quizData={exportableQuizData} />
              </Flex>
            </Box>
          </Box>
        </>
      )}
    </ExportMenuWrap>
  );
};

export default ExportMenu;
