"use client";

import { useEffect, useState } from "react";

import { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { Box, Flex, Grid } from "@radix-ui/themes";
import { lessonSections } from "ai-apps/lesson-planner/lessonSection";
import { usePosthogFeedbackSurvey } from "hooks/surveys/usePosthogFeedbackSurvey";

import { setLessonPlanProgress } from "@/components/AppComponents/Chat/Chat/utils";
import { useDialog } from "@/components/AppComponents/DialogContext";
import Layout from "@/components/AppComponents/Layout";
import Button from "@/components/Button";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import { DownloadButton } from "@/components/DownloadButton";
import { useExportAdditionalMaterials } from "@/components/ExportsDialogs/useExportAdditionalMaterials";
import { useExportLessonPlanDoc } from "@/components/ExportsDialogs/useExportLessonPlanDoc";
import { useExportLessonSlides } from "@/components/ExportsDialogs/useExportLessonSlides";
import { useExportQuizDoc } from "@/components/ExportsDialogs/useExportQuizDoc";
import { useExportWorksheetSlides } from "@/components/ExportsDialogs/useExportWorksheetSlides";
import { Icon } from "@/components/Icon";

interface DownloadPageProps {
  chat: AilaPersistedChat;
  featureFlag: boolean;
}
export default function DownloadPage({
  chat,
  featureFlag,
}: Readonly<DownloadPageProps>) {
  return (
    <Layout featureFlag>
      <DownloadPageContents chat={chat} featureFlag={featureFlag} />
    </Layout>
  );
}

export function DownloadPageContents({ chat }: Readonly<DownloadPageProps>) {
  const { setDialogWindow } = useDialog();

  const [undefinedLessonPlanSections, setUndefinedLessonPlanSections] =
    useState<string[]>([]);
  const lessonPlan = chat.lessonPlan;
  useEffect(() => {
    setLessonPlanProgress({
      lessonPlan: lessonPlan,
      setUndefinedItems: setUndefinedLessonPlanSections,
    });
  }, [lessonPlan, setUndefinedLessonPlanSections]);

  const exportProps = {
    onStart: () => null,
    lesson: lessonPlan,
    chatId: chat.id,
    messageId: chat.messages.length,
    active: true,
  };

  const lessonSlidesExport = useExportLessonSlides(exportProps);

  const worksheetExport = useExportWorksheetSlides(exportProps);

  const lessonPlanExport = useExportLessonPlanDoc(exportProps);

  const starterQuizExport = useExportQuizDoc({
    ...exportProps,
    quizType: "starter",
  });

  const exitQuizExport = useExportQuizDoc({
    ...exportProps,
    quizType: "exit",
  });

  const additionalMaterialsExport = useExportAdditionalMaterials(exportProps);

  const { survey } = usePosthogFeedbackSurvey({
    closeDialog: () => null,
    surveyName: "End of Aila generation survey launch aug24",
  });

  useEffect(() => {
    if (survey) {
      const timer = setTimeout(() => {
        setDialogWindow("feedback");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [survey, setDialogWindow]);

  return (
    <DialogRoot>
      <DialogContents
        chatId={chat.id}
        lesson={lessonPlan}
        isShared={chat.isShared}
      />
      <div className="mx-auto mb-26 mt-30 w-full max-w-[1280px] px-9">
        <Box width="100%">
          <Box className="w-full">
            <Button
              variant="text-link"
              href={`/aila/${chat.id}`}
              icon="chevron-left"
              iconPosition="leading"
              size="sm"
            >
              <span className="text-base font-light underline">
                {lessonPlan.title ? lessonPlan.title : "Back to lesson"}
              </span>
            </Button>

            <div>
              <h1 className="my-24 text-4xl font-bold">Download resources</h1>
              <p className="mb-24 max-w-[600px]">
                Complete all 12 sections of your lesson to unlock resources
                below. If a section is missing, just ask Aila to help you
                complete your lesson.
              </p>
            </div>
            <Grid
              columns={{
                initial: "1",
                sm: "2",
              }}
              className="gap-26"
            >
              <Flex direction="column" className="gap-14">
                <DownloadButton
                  onClick={() => lessonPlanExport.start()}
                  title="Lesson plan"
                  subTitle="All sections"
                  downloadAvailable={!!lessonPlanExport.readyToExport}
                  downloadLoading={lessonPlanExport.status === "loading"}
                  data={lessonPlanExport.data}
                  exportsType="lessonPlanDoc"
                  data-testid="chat-download-lesson-plan"
                  lesson={lessonPlan}
                />
                <DownloadButton
                  onClick={() => starterQuizExport.start()}
                  title="Starter quiz"
                  subTitle="Questions and answers"
                  downloadAvailable={!!starterQuizExport.readyToExport}
                  downloadLoading={starterQuizExport.status === "loading"}
                  data={starterQuizExport.data}
                  exportsType="starterQuiz"
                  lesson={lessonPlan}
                />
                <DownloadButton
                  onClick={() => lessonSlidesExport.start()}
                  data-testid="chat-download-slides-btn"
                  title="Slide deck"
                  subTitle="Outcomes, key words, 1-3 learning cycles, summary"
                  downloadAvailable={lessonSlidesExport.readyToExport}
                  downloadLoading={lessonSlidesExport.status === "loading"}
                  data={lessonSlidesExport.data}
                  exportsType="lessonSlides"
                  lesson={lessonPlan}
                />
                <DownloadButton
                  onClick={() => worksheetExport.start()}
                  title="Worksheet"
                  subTitle="Interactive activities"
                  downloadAvailable={!!worksheetExport.readyToExport}
                  downloadLoading={worksheetExport.status === "loading"}
                  data={worksheetExport.data}
                  lesson={lessonPlan}
                  exportsType="worksheet"
                />
                <DownloadButton
                  onClick={() => exitQuizExport.start()}
                  title="Exit quiz"
                  subTitle="Questions and answers"
                  downloadAvailable={!!exitQuizExport.readyToExport}
                  downloadLoading={exitQuizExport.status === "loading"}
                  data={exitQuizExport.data}
                  exportsType="exitQuiz"
                  lesson={lessonPlan}
                />
                {lessonPlan.additionalMaterials &&
                  lessonPlan.additionalMaterials !== "None" && (
                    <DownloadButton
                      onClick={() => additionalMaterialsExport.start()}
                      title="Additional materials"
                      subTitle="Document containing any additional materials"
                      downloadAvailable={
                        !!additionalMaterialsExport.readyToExport
                      }
                      downloadLoading={
                        additionalMaterialsExport.status === "loading"
                      }
                      data={additionalMaterialsExport.data}
                      exportsType="additionalMaterials"
                      lesson={lessonPlan}
                    />
                  )}
              </Flex>
              <Box>
                <div className="mb-17">
                  <span className=" font-bold">
                    {`${lessonSections.length - undefinedLessonPlanSections.length}
            of ${lessonSections.length} sections complete`}
                  </span>
                </div>
                {lessonSections.map((section) => {
                  return (
                    <span key={section} className="mb-7 flex gap-6 py-5">
                      <span
                        className={`flex w-14 items-center justify-center ${
                          undefinedLessonPlanSections.includes(section)
                            ? "opacity-30"
                            : "opacity-100"
                        }`}
                      >
                        <Icon icon="tick" className="mr-2" size="sm" />
                      </span>
                      <p key={section}>
                        {section.includes("Cycle 1") ? "Cycles 1-3" : section}
                      </p>
                    </span>
                  );
                })}
              </Box>
            </Grid>
          </Box>
        </Box>
      </div>
    </DialogRoot>
  );
}
