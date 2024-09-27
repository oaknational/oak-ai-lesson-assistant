import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { Box } from "@radix-ui/themes";
import Link from "next/link";

import { getLessonTrackingProps } from "@/lib/analytics/helpers";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { ResourceFileTypeValueType } from "@/lib/avo/Avo";
import { trpc } from "@/utils/trpc";

import {
  ExportsType,
  getExportsConfig,
} from "./ExportsDialogs/exports.helpers";
import { Icon } from "./Icon";
import LoadingWheel from "./LoadingWheel";
import LessonIcon from "./SVGParts/LessonIcon";
import QuizIcon from "./SVGParts/QuizIcon";
import SlidesIcon from "./SVGParts/SlidesIcon";

export const DownloadButton = ({
  chatId,
  onClick,
  lesson,
  title,
  subTitle,
  downloadAvailable,
  downloadLoading,
  data,
  exportsType,
  "data-testid": dataTestId,
}: {
  chatId: string;
  onClick: () => void;
  lesson: LooseLessonPlan;
  title: string;
  subTitle: string;
  downloadAvailable: boolean;
  downloadLoading: boolean;
  data?: { link: string } | { message: string; error?: unknown };
  exportsType: ExportsType;
  "data-testid"?: string;
}) => {
  const lessonTitle = lesson.title;
  const link = data && "link" in data ? data.link : "";
  const hasError = data && "message" in data;
  const errorMessage = data && "message" in data ? data.message : "";
  const { track } = useAnalytics();

  const { icon, ext, analyticsResourceType } = getExportsConfig(exportsType);

  const { isSuccess, isError, mutateAsync, isLoading } =
    trpc.exports.sendUserExportLink.useMutation();

  function trackDownload(resourceFileType: ResourceFileTypeValueType) {
    track.lessonPlanResourcesDownloaded({
      chatId,
      ...getLessonTrackingProps({ lesson }),
      resourceType: [analyticsResourceType],
      resourceFileType,
    });
  }

  if (link) {
    const fileId =
      data && "link" in data && data.link?.split("/edit")[0]?.split("/d/")[1];

    return (
      <div
        className="flex flex-col items-start rounded-md border-2 border-black px-14 py-14"
        data-testid={dataTestId}
      >
        <Link
          onClick={() => trackDownload(ext)}
          className="flex w-full items-center justify-start  gap-15 hover:underline"
          href={`/api/aila-download?fileId=${fileId}&ext=${ext}&lessonTitle=${lessonTitle}`}
          target="_blank"
        >
          <Icon icon="download" size="sm" />
          <div className="flex flex-col gap-6">
            <span className="text-left font-bold">
              Download {title.toLocaleLowerCase()} (.{ext})
            </span>
            <span className="text-left opacity-80">All sections</span>
          </div>
        </Link>
        <span className="my-12 h-[2px] w-full bg-black opacity-15" />
        <Link
          onClick={() => trackDownload("pdf")}
          className="flex w-full items-center justify-start  gap-15 hover:underline"
          href={`/api/aila-download?fileId=${fileId}&ext=pdf&lessonTitle=${lessonTitle}`}
          target="_blank"
        >
          <Icon icon="download" size="sm" />
          <div className="flex flex-col gap-6">
            <span className="text-left font-bold">
              Download {title.toLowerCase()} (.pdf)
            </span>
            <span className="text-left opacity-80">All sections</span>
          </div>
        </Link>
        <span className="my-12 h-[2px] w-full bg-black opacity-15" />

        <Link
          onClick={() => trackDownload("share to google drive")}
          className="hidden w-full items-center  justify-start gap-15 hover:underline sm:flex"
          target="_blank"
          href={`${link.split("/edit")[0]}/copy`}
          data-testid={`${dataTestId}-open-google-drive`}
        >
          <Icon icon="external" size="sm" />
          <div className="flex flex-col gap-6">
            <span className="text-left font-bold">
              Copy {title.toLowerCase()} to my Google Drive
            </span>
            <span className="text-left opacity-80">
              Google account needed for this option
            </span>
          </div>
        </Link>
        <button
          className="flex w-full items-center  justify-start gap-15 hover:underline sm:hidden"
          onClick={async () => {
            const lessonTitle = lesson.title;
            if (!lessonTitle) return;
            mutateAsync({
              lessonTitle,
              title,
              link,
            });
          }}
        >
          {handleSendEmailIcon({ isSuccess, isLoading, isError })}
          <div className="flex flex-col gap-6">
            <span className="text-left font-bold">
              Email me {ext === "docx" ? `gdoc` : `gslides`}{" "}
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

function handleSendEmailIcon({
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
