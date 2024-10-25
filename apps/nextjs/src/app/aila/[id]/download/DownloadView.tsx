"use client";

import { type AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { Box, Flex, Grid } from "@radix-ui/themes";

import Layout from "@/components/AppComponents/Layout";
import { DownloadAllButton } from "@/components/AppComponents/download/DownloadAllButton";
import { DownloadButton } from "@/components/AppComponents/download/DownloadButton";
import SectionsCompleteDownloadNotice from "@/components/AppComponents/download/SectionsCompleteDownloadNotice";
import SectionsNotCompleteDownloadNotice from "@/components/AppComponents/download/SectionsNotCompleteDownloadNotice";
import Button from "@/components/Button";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import { Icon } from "@/components/Icon";

import { SurveyDialogLauncher } from "./SurveyDialogLauncher";
import { useDownloadView } from "./useDownloadView";

type DownloadViewProps = Readonly<{
  chat: AilaPersistedChat;
}>;
export function DownloadView({ chat }: Readonly<DownloadViewProps>) {
  const { lessonPlan, id } = chat;
  const {
    lessonSlidesExport,
    worksheetExport,
    lessonPlanExport,
    starterQuizExport,
    exitQuizExport,
    additionalMaterialsExport,
    sections,
    totalSections,
    totalSectionsComplete,
    exportAllAssets,
  } = useDownloadView(chat);

  const isLessonComplete = totalSectionsComplete >= totalSections;

  return (
    <Layout>
      <DialogRoot>
        <DialogContents
          chatId={chat.id}
          lesson={lessonPlan}
          isShared={chat.isShared}
        />
        <SurveyDialogLauncher />
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
                  Back to lesson
                </span>
              </Button>

              <div>
                <h1 className="my-24 text-4xl font-bold">Download resources</h1>
                <p className="mb-24 max-w-[600px]">
                  {isLessonComplete ? (
                    <SectionsCompleteDownloadNotice />
                  ) : (
                    <SectionsNotCompleteDownloadNotice sections={sections} />
                  )}
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
                  <DownloadAllButton
                    onClick={() => exportAllAssets.start()}
                    title="Download all resources"
                    subTitle="Lesson plan, starter and exit quiz, slides and worksheet"
                    downloadAvailable={!!exportAllAssets.readyToExport}
                    downloadLoading={exportAllAssets.status === "loading"}
                    data={exportAllAssets.data}
                    data-testid="chat-download-all-resources"
                    lesson={lessonPlan}
                    chatId={id}
                  />
                  <DownloadButton
                    chatId={id}
                    onClick={() => lessonPlanExport.start()}
                    title="Lesson plan"
                    subTitle="Overview of the complete lesson"
                    downloadAvailable={!!lessonPlanExport.readyToExport}
                    downloadLoading={lessonPlanExport.status === "loading"}
                    data={lessonPlanExport.data}
                    exportsType="lessonPlanDoc"
                    data-testid="chat-download-lesson-plan"
                    lesson={lessonPlan}
                  />
                  <DownloadButton
                    chatId={id}
                    onClick={() => starterQuizExport.start()}
                    title="Starter quiz"
                    subTitle="Questions and answers to assess prior knowledge"
                    downloadAvailable={!!starterQuizExport.readyToExport}
                    downloadLoading={starterQuizExport.status === "loading"}
                    data={starterQuizExport.data}
                    exportsType="starterQuiz"
                    lesson={lessonPlan}
                  />
                  <DownloadButton
                    chatId={id}
                    onClick={() => lessonSlidesExport.start()}
                    data-testid="chat-download-slides-btn"
                    title="Slide deck"
                    subTitle="Learning outcome, keywords and learning cycles"
                    downloadAvailable={lessonSlidesExport.readyToExport}
                    downloadLoading={lessonSlidesExport.status === "loading"}
                    data={lessonSlidesExport.data}
                    exportsType="lessonSlides"
                    lesson={lessonPlan}
                  />
                  <DownloadButton
                    chatId={id}
                    onClick={() => worksheetExport.start()}
                    title="Worksheet"
                    subTitle="Practice tasks"
                    downloadAvailable={!!worksheetExport.readyToExport}
                    downloadLoading={worksheetExport.status === "loading"}
                    data={worksheetExport.data}
                    lesson={lessonPlan}
                    exportsType="worksheet"
                  />
                  <DownloadButton
                    chatId={id}
                    onClick={() => exitQuizExport.start()}
                    title="Exit quiz"
                    subTitle="Questions and answers to assess understanding"
                    downloadAvailable={!!exitQuizExport.readyToExport}
                    downloadLoading={exitQuizExport.status === "loading"}
                    data={exitQuizExport.data}
                    exportsType="exitQuiz"
                    lesson={lessonPlan}
                  />
                  {lessonPlan.additionalMaterials &&
                    lessonPlan.additionalMaterials !== "None" && (
                      <DownloadButton
                        chatId={id}
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
                      {`${totalSectionsComplete} of ${totalSections} sections complete`}
                    </span>
                  </div>
                  {sections.map((section) => {
                    return (
                      <span
                        key={`progress-sections-${section.label}`}
                        className="mb-7 flex gap-6 py-5"
                      >
                        <span
                          className={`flex w-14 items-center justify-center ${
                            section.complete ? "opacity-100" : "opacity-30"
                          }`}
                        >
                          <Icon icon="tick" className="mr-2" size="sm" />
                        </span>
                        <p>{section.label}</p>
                      </span>
                    );
                  })}
                </Box>
              </Grid>
            </Box>
          </Box>
        </div>
      </DialogRoot>
    </Layout>
  );
}
