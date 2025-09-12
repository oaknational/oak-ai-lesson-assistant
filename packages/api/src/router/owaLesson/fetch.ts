import { aiLogger } from "@oakai/logger";
import { TRPCError } from "@trpc/server";

import {
  lessonOverviewQuery,
  lessonOverviewQueryCanonical,
  tcpWorksByLessonSlugQuery,
} from "./queries";
import type { LessonOverviewResponse, TRPCWorksResponse } from "./types";

const log = aiLogger("additional-materials");

type FetchArgs = {
  lessonSlug: string;
  programmeSlug?: string | null;
  authKey: string;
  authType: string;
  graphqlEndpoint: string;
};

type FetchResult = {
  lessonData: LessonOverviewResponse;
  tcpData: TRPCWorksResponse;
  isCanonicalLesson: boolean;
};

export async function fetchOwaLessonAndTcp({
  lessonSlug,
  programmeSlug,
  authKey,
  authType,
  graphqlEndpoint,
}: FetchArgs): Promise<FetchResult> {
  const isCanonicalLesson = !programmeSlug;

  const lessonResponse = await fetch(String(graphqlEndpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-oak-auth-key": authKey,
      "x-oak-auth-type": authType,
    },
    body: JSON.stringify({
      query: isCanonicalLesson
        ? lessonOverviewQueryCanonical
        : lessonOverviewQuery,
      variables: {
        lesson_slug: lessonSlug,
        ...(!isCanonicalLesson ? { programme_slug: programmeSlug } : {}),
      },
    }),
  });

  if (!lessonResponse.ok) {
    log.error("Failed to fetch lesson data", {
      status: lessonResponse.status,
      statusText: lessonResponse.statusText,
      lessonSlug,
      programmeSlug,
    });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch lesson data from curriculum API",
    });
  }

  const tcpResponse = await fetch(String(graphqlEndpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-oak-auth-key": authKey,
      "x-oak-auth-type": authType,
    },
    body: JSON.stringify({
      query: tcpWorksByLessonSlugQuery,
      variables: { lesson_slug: lessonSlug },
    }),
  });

  if (!tcpResponse.ok) {
    log.error("Failed to fetch TCP data", {
      status: tcpResponse.status,
      statusText: tcpResponse.statusText,
    });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch TCP data",
    });
  }

  try {
    const lessonData: LessonOverviewResponse = await lessonResponse.json();
    const tcpData: TRPCWorksResponse = await tcpResponse.json();

    if (!lessonData.data?.content?.[0] || !lessonData.data?.browseData?.[0]) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
    }

    return { lessonData, tcpData, isCanonicalLesson };
  } catch (jsonError) {
    log.error("Failed to parse API responses", { jsonError });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Invalid response format from API",
    });
  }
}

