import { useState } from "react";
import { toast } from "react-hot-toast";

import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import { Box } from "@radix-ui/themes";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { z } from "zod";

import useAnalytics from "@/lib/analytics/useAnalytics";
import { trpc } from "@/utils/trpc";

import { getExportsConfig } from "../../ExportsDialogs/exports.helpers";
import { Icon } from "../../Icon";
import LoadingWheel from "../../LoadingWheel";
import LessonIcon from "../../SVGParts/LessonIcon";
import QuizIcon from "../../SVGParts/QuizIcon";
import SlidesIcon from "../../SVGParts/SlidesIcon";
import { trackDownload } from "./trackDownload";

const log = aiLogger("chat");

const allExportLinksObject = z.object({
  lessonSlides: z.string(),
  lessonPlan: z.string(),
  worksheet: z.string(),
  additionalMaterials: z.string(),
  starterQuiz: z.string(),
  exitQuiz: z.string(),
});

type Data = {
  lessonSlides: string | undefined;
  lessonPlan: string | undefined;
  worksheet: string | undefined;
  additionalMaterials: string | undefined;
  starterQuiz: string | undefined;
  exitQuiz: string | undefined;
};

type DownloadAllButtonProps = {
  onClick: () => void;
  lesson: LooseLessonPlan;
  title: string;
  subTitle: string;
  downloadAvailable: boolean;
  downloadLoading: boolean;
  data:
    | Data
    | {
        error: unknown;
        message: string;
      }
    | undefined;
  "data-testid"?: string;
  chatId: string;
};

type zipDownloadStatus = "idle" | "loading" | "complete" | "error";

type FileIdsAndFormats = { fileId: string; formats: string[] }[];

const getFileIdsAndFormats = (data: Data): FileIdsAndFormats => {
  return Object.entries(data)
    .filter(([, value]) => !!value)
    .map(([key, value]) => {
      const fileId = value?.split("/edit")[0]?.split("/d/")?.[1];
      if (!fileId) {
        throw new Error("File ID not found");
      }
      return {
        fileId,
        formats: key === "lessonSlides" ? ["pptx", "pdf"] : ["docx", "pdf"],
      };
    });
};

export const DownloadAllButton = ({
  onClick,
  lesson,
  title,
  subTitle,
  downloadAvailable,
  downloadLoading,
  data,
  chatId,
  "data-testid": dataTestId,
}: Readonly<DownloadAllButtonProps>) => {
  const link = data && "link" in data ? data.link : "";
  const hasError = data && "message" in data;
  const errorMessage = data && "message" in data ? data.message : "";

  const [zipStatus, setZipStatus] = useState<zipDownloadStatus>("idle");
  const { icon, ext, analyticsResourceType } = getExportsConfig("all");
  const { isSuccess, isError, mutateAsync, isLoading } =
    trpc.exports.sendUserAllAssetsEmail.useMutation();
  const { track } = useAnalytics();
  const { mutateAsync: zipStatusMutateAsync } =
    trpc.exports.checkDownloadAllStatus.useMutation();

  if (data && !("error" in data)) {
    const fileIdsAndFormats = getFileIdsAndFormats(data);

    const taskId = `download-all-${JSON.stringify(fileIdsAndFormats)}`;

    function sendAllLinksEmail() {
      try {
        const lessonTitle = lesson.title;
        if (!lessonTitle) return;
        const parsedData = allExportLinksObject.parse(data);
        mutateAsync({
          lessonTitle,
          slidesLink: parsedData.lessonSlides,
          worksheetLink: parsedData.worksheet,
          starterQuizLink: parsedData.starterQuiz,
          exitQuizLink: parsedData.exitQuiz,
          additionalMaterialsLink: parsedData.additionalMaterials,
          lessonPlanLink: parsedData.lessonPlan,
        }).catch((error) => {
          log.error(error);
          Sentry.captureException(error, { extra: { chatId } });
          toast.error("Failed to send email");
        });
      } catch (error) {
        log.error(error);
        Sentry.captureException(error);
        toast.error("Failed to send email");
      }
    }
    function handleZipDownloadStatus() {
      const timer = setInterval(() => {
        setZipStatus("loading");
        zipStatusMutateAsync({ taskId })
          .then((response) => {
            if (response === "complete") {
              setZipStatus("complete");
              clearInterval(timer);
            }
          })
          .catch((error) => {
            log.error(error);
            Sentry.captureException(error, { extra: { chatId } });
            clearInterval(timer);
          });
      }, 1000);
    }

    return (
      <div
        className="flex flex-col items-start rounded-md border-2 border-black px-14 py-14"
        data-testid={dataTestId}
      >
        <Link
          onClick={() => {
            trackDownload(ext, analyticsResourceType, lesson, track, chatId);
            handleZipDownloadStatus();
          }}
          className="flex w-full items-center justify-start gap-15 hover:underline"
          href={`/api/aila-download-all?fileIds=${encodeURIComponent(JSON.stringify(fileIdsAndFormats))}&lessonTitle=${encodeURIComponent(lesson.title as string)}`}
          prefetch={false}
          download
        >
          {zipStatus === "loading" ? (
            <LoadingWheel />
          ) : (
            <Icon icon="download" size="sm" />
          )}
          <div className="flex flex-col gap-6">
            <span className="text-left font-bold">
              Download all resources (.docx, .ppt, .pdf)
            </span>
            <span className="text-left opacity-80">
              {subTitle}
              {zipStatus === "loading" && "- this can take up to 60s"}
            </span>
          </div>
        </Link>
        <span className="my-12 h-[2px] w-full bg-black opacity-15" />

        <button
          className="flex w-full items-center justify-start gap-15 hover:underline"
          onClick={() => sendAllLinksEmail()}
        >
          <SendEmailIcon
            isSuccess={isSuccess}
            isError={isError}
            isLoading={isLoading}
          />
          <div className="flex flex-col gap-6">
            <span className="text-left font-bold">
              Email me
              {isSuccess && "- email sent"}{" "}
              {isError && "- There was an error sending the email!"}
            </span>
            <span className="text-left opacity-80">
              Google account needed for this option
            </span>
          </div>
        </button>
      </div>
    );
  }
  return (
    <>
      <button
        className={`flex items-center justify-between gap-9 rounded-md border-2 border-black px-14 py-10 ${downloadAvailable ? "border-opacity-100" : "border-opacity-40"}`}
        onClick={() => onClick()}
        disabled={!downloadAvailable}
        data-testid={dataTestId}
      >
        <div className="flex items-center justify-start gap-7">
          {handleIcon({
            hasLink: !!link,
            hasError: !!hasError,
            downloadAvailable,
            downloadLoading,
            icon,
          })}
          <div className="flex flex-col items-start justify-start gap-6">
            <span className="text-left font-bold">{title}</span>
            {downloadLoading ? (
              <span className="text-left text-[#287C34] opacity-80">
                Generating exports
              </span>
            ) : (
              <span className="text-left opacity-80">{subTitle}</span>
            )}
          </div>
        </div>
        {!!link && (
          <span className="flex items-center gap-5">
            <span className="text-sm">Options</span>
            <Icon icon="arrow-right" size="sm" />
          </span>
        )}
      </button>
      {hasError && <p className="mt-2 text-sm text-red-500">{errorMessage}</p>}
    </>
  );
};

function handleIcon({
  hasLink,
  hasError,
  downloadAvailable,
  downloadLoading,
  icon,
}: {
  hasLink: boolean;
  hasError: boolean;
  downloadAvailable: boolean;
  downloadLoading: boolean;
  icon: "slides" | "lesson" | "quiz";
}) {
  if (hasLink) {
    return null;
  } else if (!downloadAvailable) {
    return (
      <Box className="w-20">
        <Icon icon={"padlock"} className="mr-4" size="md" />
      </Box>
    );
  } else if (downloadLoading) {
    return (
      <Box className="w-20">
        <LoadingWheel />
      </Box>
    );
  } else if (hasError) {
    return (
      <Box className="w-20">
        <Icon icon={"chevron-down"} className="mr-4" size="sm" />
      </Box>
    );
  } else if (downloadAvailable && !downloadLoading) {
    return (
      <Box className="mr-6 w-20">
        {icon === "slides" && <SlidesIcon />}
        {icon === "lesson" && <LessonIcon />}
        {icon === "quiz" && <QuizIcon />}
      </Box>
    );
  }
  return null;
}

export function SendEmailIcon({
  isSuccess,
  isError,
  isLoading,
}: Readonly<{
  isSuccess: boolean;
  isError: boolean;
  isLoading: boolean;
}>) {
  if (isLoading) {
    return <LoadingWheel />;
  } else if (isSuccess) {
    return <Icon icon="tick" size="sm" />;
  } else if (isError) {
    return <Icon icon="cross" size="sm" />;
  }
  return <Icon icon="external" size="sm" />;
}
