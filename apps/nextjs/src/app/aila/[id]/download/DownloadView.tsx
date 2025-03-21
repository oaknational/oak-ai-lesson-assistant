"use client";

import { useEffect, useState } from "react";

import type {
  AilaPersistedChat,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";

import { Box, Flex, Grid } from "@radix-ui/themes";

import Layout from "@/components/AppComponents/Layout";
import { DownloadAllButton } from "@/components/AppComponents/download/DownloadAllButton";
import { DownloadButton } from "@/components/AppComponents/download/DownloadButton";
import SectionsCompleteDownloadNotice from "@/components/AppComponents/download/SectionsCompleteDownloadNotice";
import SectionsNotCompleteDownloadNotice from "@/components/AppComponents/download/SectionsNotCompleteDownloadNotice";
import Button from "@/components/Button";
import { useTranslation } from "@/components/ContextProviders/LanguageContext";
import DialogContents from "@/components/DialogControl/DialogContents";
import { DialogRoot } from "@/components/DialogControl/DialogRoot";
import { Icon } from "@/components/Icon";

import { SurveyDialogLauncher } from "./SurveyDialogLauncher";
import { useDownloadView } from "./useDownloadView";

type DownloadViewProps = Readonly<{
  chat: AilaPersistedChat;
}>;
export function DownloadContent({ chat }: Readonly<DownloadViewProps>) {
  const [translatedLessonPlan, setTranslatedLessonPlan] =
    useState<LooseLessonPlan | null>(null);
  const { lessonPlan, id } = chat;
  const { t } = useTranslation();
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

  useEffect(() => {
    const translatedLessonPlan =
      localStorage.getItem(`${id}-translatedLessonPlan`) ?? "";
    if (!translatedLessonPlan) {
      return;
    }
    const parsedTranslatedLessonPlan: LooseLessonPlan =
      JSON.parse(translatedLessonPlan);
    if (translatedLessonPlan) {
      setTranslatedLessonPlan(parsedTranslatedLessonPlan);
    }
  }, [id]);

  return (
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
                {t("chat.backToLesson")}
              </span>
            </Button>

            <div>
              <h1 className="my-24 text-4xl font-bold">
                {t("chat.downloadResources")}
              </h1>
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
              {translatedLessonPlan ? (
                <Flex direction="row" className="gap-14">
                  <Flex direction="column" className="gap-14">
                    <DownloadAllButton
                      onClick={() => exportAllAssets.start()}
                      title={t("download.allResources")}
                      subTitle={t("download.allResourcesSubtitle")}
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
                      title={t("accordion.lessonPlan")}
                      subTitle={t("download.lessonPlanSubtitle")}
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
                      title={t("progressDropdown.starterQuiz")}
                      subTitle={t("download.starterQuizSubtitle")}
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
                      title={t("download.slideDeck")}
                      subTitle={t("download.slideDeckSubtitle")}
                      downloadAvailable={lessonSlidesExport.readyToExport}
                      downloadLoading={lessonSlidesExport.status === "loading"}
                      data={lessonSlidesExport.data}
                      exportsType="lessonSlides"
                      lesson={lessonPlan}
                    />
                    <DownloadButton
                      chatId={id}
                      onClick={() => worksheetExport.start()}
                      title={t("accordion.pupilWorksheet")}
                      subTitle={t("download.worksheetSubtitle")}
                      downloadAvailable={!!worksheetExport.readyToExport}
                      downloadLoading={worksheetExport.status === "loading"}
                      data={worksheetExport.data}
                      lesson={lessonPlan}
                      exportsType="worksheet"
                    />
                    <DownloadButton
                      chatId={id}
                      onClick={() => exitQuizExport.start()}
                      title={t("progressDropdown.exitQuiz")}
                      subTitle={t("download.exitQuizSubtitle")}
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
                          title={t("download.additionalMaterials")}
                          subTitle={t("download.additionalMaterialsSubtitle")}
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
                  <Flex direction="column" className="gap-14">
                    <DownloadAllButton
                      onClick={() => exportAllAssets.start()}
                      title={t("download.allTranslatedResources")}
                      subTitle={t("download.allResourcesSubtitle")}
                      downloadAvailable={!!exportAllAssets.readyToExport}
                      downloadLoading={exportAllAssets.status === "loading"}
                      data={exportAllAssets.data}
                      data-testid="chat-download-all-resources"
                      lesson={translatedLessonPlan}
                      chatId={id}
                    />
                    <DownloadButton
                      chatId={id}
                      onClick={() => lessonPlanExport.start()}
                      title={t("download.translatedLessonPlan")}
                      subTitle={t("download.lessonPlanSubtitle")}
                      downloadAvailable={!!lessonPlanExport.readyToExport}
                      downloadLoading={lessonPlanExport.status === "loading"}
                      data={lessonPlanExport.data}
                      exportsType="lessonPlanDoc"
                      data-testid="chat-download-lesson-plan"
                      lesson={translatedLessonPlan}
                    />
                    <DownloadButton
                      chatId={id}
                      onClick={() => starterQuizExport.start()}
                      title={t("download.translatedStarterQuiz")}
                      subTitle={t("download.starterQuizSubtitle")}
                      downloadAvailable={!!starterQuizExport.readyToExport}
                      downloadLoading={starterQuizExport.status === "loading"}
                      data={starterQuizExport.data}
                      exportsType="starterQuiz"
                      lesson={translatedLessonPlan}
                    />
                    <DownloadButton
                      chatId={id}
                      onClick={() => lessonSlidesExport.start()}
                      data-testid="chat-download-slides-btn"
                      title={t("download.translatedSlideDeck")}
                      subTitle={t("download.slideDeckSubtitle")}
                      downloadAvailable={lessonSlidesExport.readyToExport}
                      downloadLoading={lessonSlidesExport.status === "loading"}
                      data={lessonSlidesExport.data}
                      exportsType="lessonSlides"
                      lesson={translatedLessonPlan}
                    />
                    <DownloadButton
                      chatId={id}
                      onClick={() => worksheetExport.start()}
                      title={t("download.translatedWorksheet")}
                      subTitle={t("download.worksheetSubtitle")}
                      downloadAvailable={!!worksheetExport.readyToExport}
                      downloadLoading={worksheetExport.status === "loading"}
                      data={worksheetExport.data}
                      lesson={translatedLessonPlan}
                      exportsType="worksheet"
                    />
                    <DownloadButton
                      chatId={id}
                      onClick={() => exitQuizExport.start()}
                      title={t("download.translatedExitQuiz")}
                      subTitle={t("download.exitQuizSubtitle")}
                      downloadAvailable={!!exitQuizExport.readyToExport}
                      downloadLoading={exitQuizExport.status === "loading"}
                      data={exitQuizExport.data}
                      exportsType="exitQuiz"
                      lesson={translatedLessonPlan}
                    />
                    {lessonPlan.additionalMaterials &&
                      lessonPlan.additionalMaterials !== "None" && (
                        <DownloadButton
                          chatId={id}
                          onClick={() => additionalMaterialsExport.start()}
                          title={t("download.translatedAdditionalMaterials")}
                          subTitle={t("download.additionalMaterialsSubtitle")}
                          downloadAvailable={
                            !!additionalMaterialsExport.readyToExport
                          }
                          downloadLoading={
                            additionalMaterialsExport.status === "loading"
                          }
                          data={additionalMaterialsExport.data}
                          exportsType="additionalMaterials"
                          lesson={translatedLessonPlan}
                        />
                      )}
                  </Flex>
                </Flex>
              ) : (
                <Flex direction="column" className="gap-14">
                  <DownloadAllButton
                    onClick={() => exportAllAssets.start()}
                    title={t("download.allResources")}
                    subTitle={t("download.allResourcesSubtitle")}
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
                    title={t("accordion.lessonPlan")}
                    subTitle={t("download.lessonPlanSubtitle")}
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
                    title={t("progressDropdown.starterQuiz")}
                    subTitle={t("download.starterQuizSubtitle")}
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
                    title={t("download.slideDeck")}
                    subTitle={t("download.slideDeckSubtitle")}
                    downloadAvailable={lessonSlidesExport.readyToExport}
                    downloadLoading={lessonSlidesExport.status === "loading"}
                    data={lessonSlidesExport.data}
                    exportsType="lessonSlides"
                    lesson={lessonPlan}
                  />
                  <DownloadButton
                    chatId={id}
                    onClick={() => worksheetExport.start()}
                    title={t("accordion.pupilWorksheet")}
                    subTitle={t("download.worksheetSubtitle")}
                    downloadAvailable={!!worksheetExport.readyToExport}
                    downloadLoading={worksheetExport.status === "loading"}
                    data={worksheetExport.data}
                    lesson={lessonPlan}
                    exportsType="worksheet"
                  />
                  <DownloadButton
                    chatId={id}
                    onClick={() => exitQuizExport.start()}
                    title={t("progressDropdown.exitQuiz")}
                    subTitle={t("download.exitQuizSubtitle")}
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
                        title={t("download.additionalMaterials")}
                        subTitle={t("download.additionalMaterialsSubtitle")}
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
              )}

              <Box>
                <div className="mb-17">
                  <span className="font-bold">
                    {t("chat.sectionsComplete")
                      .replace("{complete}", String(totalSectionsComplete))
                      .replace("{total}", String(totalSections))}
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
  );
}

export function DownloadView(props: Readonly<DownloadViewProps>) {
  return (
    <Layout>
      <DownloadContent {...props} />
    </Layout>
  );
}
