import { LessonPlanSchemaWhilstStreaming } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import AdditionalMaterialsView, {
  type AdditionalMaterialsPageProps,
} from "./AdditionalMaterialsView";

const log = aiLogger("additional-materials");

export default async function AdditionalMaterialsTestPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const canSeeAM = await serverSideFeatureFlag("additional-materials");

  if (!canSeeAM) {
    redirect("/");
  }

  const lessonSlug = searchParams?.lessonSlug;
  const programmeSlug = searchParams?.programmeSlug;
  const docType = searchParams?.docType;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  log.info("AdditionalMaterialsTestPage", {
    lessonSlug,
    programmeSlug,
    docType,
    baseUrl,
  });

  let pageProps: AdditionalMaterialsPageProps = {
    lesson: undefined,
    transcript: undefined,
    initialStep: undefined,
    docTypeFromQueryPrams: undefined,
  };

  if (lessonSlug && programmeSlug && docType) {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2525";

      const res = await fetch(`${baseUrl}/api/fetch-owa-lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonSlug: lessonSlug,
          programmeSlug: programmeSlug,
        }),
      });
      const { lesson, transcript } = await res.json();

      const parsedLesson = LessonPlanSchemaWhilstStreaming.parse(lesson);

      pageProps = {
        lesson: parsedLesson,
        transcript: transcript,
        initialStep: 2,
        docTypeFromQueryPrams: docType,
      };

      if (!parsedLesson) {
        throw new Error("Failed to parse lesson data");
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          component: "AdditionalMaterialsTestPage",
          operation: "fetch-lesson-data",
        },
        extra: {
          lessonSlug,
          programmeSlug,
          baseUrl: process.env.NEXT_PUBLIC_APP_URL,
        },
      });
      pageProps = {
        lesson: undefined,
        transcript: undefined,
        initialStep: 1,
        docTypeFromQueryPrams: "additional-glossary",
      };
    }
  }

  return <AdditionalMaterialsView {...pageProps} />;
}
