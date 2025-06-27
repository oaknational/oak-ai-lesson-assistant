import {
  type LessonPlanSchemaTeachingMaterials,
  lessonPlanSchemaTeachingMaterials,
} from "@oakai/additional-materials/src/documents/additionalMaterials/sharedSchema";
import { aiLogger } from "@oakai/logger";

import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";
import invariant from "tiny-invariant";

import { createTeachingMaterialInteraction } from "@/app/actions";
import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import TeachingMaterialsView, {
  type TeachingMaterialsPageProps,
} from "./teachingMaterialsView";

const log = aiLogger("additional-materials");

// Helper to handle copyright errors
function handleCopyrightError(
  fetchError: unknown,
  pageProps: TeachingMaterialsPageProps,
  lessonSlug: string,
  programmeSlug: string,
) {
  log.error("Copyright error fetching lesson data", {
    error: fetchError,
    lessonSlug,
    programmeSlug,
  });
  Sentry.captureException(fetchError, {
    extra: {
      message: "Copyright error fetching lesson data",
      lessonSlug,
      programmeSlug,
    },
  });
  return <TeachingMaterialsView {...{ ...pageProps, error: "copyright" }} />;
}

// Helper to fetch lesson data
async function fetchLessonData({
  lessonSlug,
  programmeSlug,
  userId,
  baseUrl,
}: {
  lessonSlug: string;
  programmeSlug: string;
  userId: string;
  baseUrl: string;
}): Promise<Response> {
  const res = await fetch(`${baseUrl}/api/fetch-owa-lesson`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lessonSlug, programmeSlug, userId }),
  });
  return res;
}

export default async function AdditionalMaterialsTestPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }
  const canSeeAM = await serverSideFeatureFlag("additional-materials");
  if (!canSeeAM) {
    redirect("/");
  }

  const lessonSlug = searchParams?.lessonSlug;
  const programmeSlug = searchParams?.programmeSlug;
  const docType = searchParams?.docType;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:2525";

  log.info("Teaching materials - owa", {
    lessonSlug,
    programmeSlug,
    docType,
    baseUrl,
  });

  let pageProps: TeachingMaterialsPageProps = {
    lesson: undefined,
    transcript: undefined,
    initialStep: undefined,
    docTypeFromQueryPrams: undefined,
    id: undefined,
  };

  if (lessonSlug && programmeSlug && docType) {
    // Linking from OWA lesson
    try {
      // Fetch lesson data
      const res = await fetchLessonData({
        lessonSlug,
        programmeSlug,
        userId,
        baseUrl,
      });
      if (!res.ok) {
        const fetchError: unknown = await res.json();
        if (
          fetchError instanceof Error &&
          fetchError.message.includes("copyright")
        ) {
          return handleCopyrightError(
            fetchError,
            pageProps,
            lessonSlug,
            programmeSlug,
          );
        } else {
          log.error("Failed to fetch lesson data", {
            error: fetchError,
            lessonSlug,
            programmeSlug,
          });
          Sentry.captureException(fetchError, {
            extra: {
              lessonSlug,
              programmeSlug,
              baseUrl: process.env.NEXT_PUBLIC_APP_URL,
            },
          });
          throw new Error("Failed to fetch lesson data");
        }
      }

      const { lesson, transcript } = await res.json();
      const { lessonId } = lesson;
      const parsedLesson = lessonPlanSchemaTeachingMaterials.parse(lesson);
      invariant(lessonId, "lessonId must be defined");

      // Create interaction in db for teaching material
      let interactionId: string | undefined = undefined;
      try {
        const interaction = await createTeachingMaterialInteraction(
          { documentType: docType },
          { userId: userId },
        );
        interactionId = interaction.id;
      } catch (interactionError) {
        log.error("Failed to create additional material interaction", {
          error: interactionError,
        });
      }

      pageProps = {
        lesson: parsedLesson,
        transcript: transcript,
        source: "owa",
        initialStep: 3,
        docTypeFromQueryPrams: docType,
        id: interactionId,
        lessonId: lessonId,
      };

      if (!parsedLesson) {
        throw new Error("Failed to parse lesson data");
      }
    } catch (error) {
      log.error("Error fetching lesson data", {
        error: error,
        lessonSlug: lessonSlug,
        programmeSlug: programmeSlug,
      });
      Sentry.captureException(error, {
        extra: {
          lessonSlug,
          programmeSlug,
        },
      });
    }
  }

  return <TeachingMaterialsView {...pageProps} />;
}
