import { lessonPlanSchemaTeachingMaterials } from "@oakai/additional-materials/src/documents/additionalMaterials/sharedSchema";
import { aiLogger } from "@oakai/logger";

import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";
import invariant from "tiny-invariant";

import { createTeachingMaterialInteraction } from "@/app/actions";
import type { ErrorResponse } from "@/stores/resourcesStore";
import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import TeachingMaterialsView, {
  type TeachingMaterialsPageProps,
} from "./teachingMaterialsView";

const log = aiLogger("additional-materials");

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  console.log("process.env.VERCEL_URL", process.env.VERCEL_URL);
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return `http://localhost:${process.env.PORT ?? 2525}`;
};

// Helper to handle expected errors
function handleExpectedError({
  fetchError,
  pageProps,
  lessonSlug,
  programmeSlug,
  source,
  error,
  docType,
}: {
  fetchError: unknown;
  pageProps: TeachingMaterialsPageProps;
  lessonSlug: string;
  programmeSlug: string;
  source: "owa" | "aila";
  error: ErrorResponse;
  docType: string;
}) {
  log.error(`${error.type}: error fetching lesson data`, {
    error: fetchError,
    lessonSlug,
    programmeSlug,
  });
  Sentry.captureException(fetchError, {
    extra: {
      message: `${error.type}: error fetching lesson data`,
      lessonSlug,
      programmeSlug,
    },
  });
  return (
    <TeachingMaterialsView
      {...{
        ...pageProps,
        error,
        docType: docType,
        source: source,
      }}
    />
  );
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
  const canUseOWALink = await serverSideFeatureFlag("additional-materials");

  const lessonSlug = searchParams?.lessonSlug;
  const programmeSlug = searchParams?.programmeSlug;
  const docType = searchParams?.docType;
  const baseUrl = getBaseUrl();

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
    source: "aila",
  };

  if (lessonSlug && programmeSlug && docType && canUseOWALink) {
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
        let fetchError: unknown;
        let errorData: { error?: string; message?: string } = {};
        
        const contentType = res.headers.get("content-type");
        
        try {
          if (contentType?.includes("application/json")) {
            fetchError = await res.json();
            errorData = fetchError as { error?: string; message?: string };
          } else {
            // Response is not JSON (likely HTML error page)
            const textError = await res.text();
            log.error("API returned non-JSON response", {
              status: res.status,
              statusText: res.statusText,
              contentType,
              responseText: textError.substring(0, 500), // Log first 500 chars
            });
            fetchError = new Error(`API returned ${res.status}: ${res.statusText}`);
            errorData = { error: `API Error: ${res.status} ${res.statusText}` };
          }
        } catch (_error) {
          // Fallback if reading response fails
          fetchError = new Error(`API returned ${res.status}: ${res.statusText}`);
          errorData = { error: `API Error: ${res.status} ${res.statusText}` };
        }

        if (
          errorData.error?.includes("copyright") ||
          errorData.message?.includes("copyright")
        ) {
          return handleExpectedError({
            fetchError,
            pageProps,
            lessonSlug,
            programmeSlug,
            docType,
            source: "owa",
            error: {
              type: "copyright",
              message:
                errorData.error ??
                errorData.message ??
                "Copyright restricted content",
            },
          });
        } else if (
          errorData.error?.includes("content-guidance") ||
          errorData.message?.includes("content-guidance")
        ) {
          return handleExpectedError({
            fetchError,
            pageProps,
            lessonSlug,
            programmeSlug,
            source: "owa",
            docType,
            error: {
              type: "restrictedContentGuidance",
              message:
                errorData.error ||
                errorData.message ||
                "Restricted content guidance",
            },
          });
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
