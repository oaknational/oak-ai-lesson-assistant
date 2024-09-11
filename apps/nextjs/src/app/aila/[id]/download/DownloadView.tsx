"use client";

import { AilaPersistedChat } from "@oakai/aila/src/protocol/schema";
import { Box, Flex, Grid } from "@radix-ui/themes";

import Layout from "@/components/AppComponents/Layout";
import Button from "@/components/Button";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import { DownloadButton } from "@/components/DownloadButton";
import { Icon } from "@/components/Icon";
import { trpc } from "@/utils/trpc";

import { SurveyDialogLauncher } from "./SurveyDialogLauncher";
import { useDownloadView } from "./useDownloadView";

type DownloadViewProps = Readonly<{
  chat: AilaPersistedChat;
}>;
export function DownloadView({ chat }: Readonly<DownloadViewProps>) {
  const { lessonPlan } = chat;
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
                  {lessonPlan.title ? lessonPlan.title : "Back to lesson"}
                </span>
              </Button>

              <div>
                <h1 className="my-24 text-4xl font-bold">Download resources</h1>
                <p className="mb-24 max-w-[600px]">
                  {isLessonComplete ? (
                    <>
                      Choose the resources you would like to generate and
                      download.
                    </>
                  ) : (
                    <>
                      Complete all {totalSections} sections of your lesson to
                      unlock resources below. If a section is missing, just ask
                      Aila to help you complete your lesson.
                    </>
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
                  <DownloadButton
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
