import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { Box } from "@radix-ui/themes";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { z } from "zod";

import { getLessonTrackingProps } from "@/lib/analytics/helpers";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { ResourceFileTypeValueType } from "@/lib/avo/Avo";
import { trpc } from "@/utils/trpc";

import {
  ExportsType,
  getExportsConfig,
} from "../../ExportsDialogs/exports.helpers";
import { Icon } from "../../Icon";
import LoadingWheel from "../../LoadingWheel";
import LessonIcon from "../../SVGParts/LessonIcon";
import QuizIcon from "../../SVGParts/QuizIcon";
import SlidesIcon from "../../SVGParts/SlidesIcon";

const allexportLinksObject = z.object({
  lessonSlides: z.string(),
  lessonPlan: z.string(),
  worksheet: z.string(),
  additionalMaterials: z.string(),
  starterQuiz: z.string(),
  exitQuiz: z.string(),
});

type DownloadAllButtonProps = {
  onClick: () => void;
  lesson: LooseLessonPlan;
  title: string;
  subTitle: string;
  downloadAvailable: boolean;
  downloadLoading: boolean;
  data:
    | {
        lessonSlides: string | undefined;
        lessonPlan: string | undefined;
        worksheet: string | undefined;
        additionalMaterials: string | undefined;
        starterQuiz: string | undefined;
        exitQuiz: string | undefined;
      }
    | {
        error: unknown;
        message: string;
      }
    | undefined;
  exportsType: ExportsType;
  "data-testid"?: string;
};

export const DownloadAllButton = ({
  onClick,
  lesson,
  title,
  subTitle,
  downloadAvailable,
  downloadLoading,
  data,
  exportsType,
  "data-testid": dataTestId,
}: Readonly<DownloadAllButtonProps>) => {
  const link = data && "link" in data ? data.link : "";
  const hasError = data && "message" in data;
  const errorMessage = data && "message" in data ? data.message : "";
  const { track } = useAnalytics();

  const { icon, ext, analyticsResourceType } = getExportsConfig(exportsType);

  const { isSuccess, isError, mutateAsync, isLoading } =
    trpc.exports.sendUserAllAssetsEmail.useMutation();

  function trackDownload(resourceFileType: ResourceFileTypeValueType) {
    track.lessonPlanResourcesDownloaded({
      ...getLessonTrackingProps({ lesson }),
      resourceType: [analyticsResourceType],
      resourceFileType,
    });
  }

  function sendAllLinksEmail() {
    try {
      const lessonTitle = lesson.title;
      if (!lessonTitle) return;
      const parsedData = allexportLinksObject.parse(data);
      mutateAsync({
        lessonTitle,
        slidesLink: parsedData.lessonSlides,
        worksheetLink: parsedData.worksheet,
        starterQuizLink: parsedData.starterQuiz,
        exitQuizLink: parsedData.exitQuiz,
        additionalMaterialsLink: parsedData.additionalMaterials,
        lessonPlanLink: parsedData.lessonPlan,
      });
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  if (data) {
    const fileIdsAndFormats:
      | ({ fileId: string | undefined; formats: string[] } | undefined)[]
      | undefined = data
      ? Object.entries(data).map(([key, value]) => {
          if (typeof value === "string") {
            return {
              fileId: value?.split("/edit")[0]?.split("/d/")?.[1],
              formats:
                key === "lessonSlides" ? ["pptx", "pdf"] : ["docx", "pdf"],
            };
          }
        })
      : undefined;

    return (
      <div
        className="flex flex-col items-start rounded-md border-2 border-black px-14 py-14"
        data-testid={dataTestId}
      >
        <Link
          onClick={() => trackDownload(ext)}
          className="flex w-full items-center justify-start  gap-15 hover:underline"
          href={`/api/aila-download-all?fileIds=${encodeURIComponent(JSON.stringify(fileIdsAndFormats))}&lessonTitle=${encodeURIComponent(lesson.title as string)}`}
          target="_blank"
        >
          <Icon icon="download" size="sm" />
          <div className="flex flex-col gap-6">
            <span className="text-left font-bold">
              Download all resources in pdf and docx/pptx
            </span>
            <span className="text-left opacity-80">All sections</span>
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
              Email me {ext === "docx" ? `doc` : `slides`}{" "}
              {isSuccess && `- Email sent`}{" "}
              {isError && `- There was an error sending the email!`}
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
        className={`flex items-center justify-between gap-9 rounded-md border-2 border-black px-14 py-10 ${downloadAvailable ? `border-opacity-100` : ` border-opacity-40`}`}
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
                Generating {title} for export
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
}: {
  isSuccess: boolean;
  isError: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingWheel />;
  } else if (isSuccess) {
    return <Icon icon="tick" size="sm" />;
  } else if (isError) {
    return <Icon icon="cross" size="sm" />;
  }
  return <Icon icon="external" size="sm" />;
}
