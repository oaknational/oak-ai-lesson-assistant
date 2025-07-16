import { aiLogger } from "@oakai/logger";

import { auth } from "@clerk/nextjs/server";
import { type SyntheticUnitvariantLessonsByKs } from "@oaknational/oak-curriculum-schema";
import * as Sentry from "@sentry/node";
import type { NextApiResponse } from "next";

import { createLessonPlanInteraction } from "@/app/actions";

import {
  checkForRestrictedContentGuidance,
  checkForRestrictedFeatures,
} from "./copyrightCheckHelper";
import { copyrightLesson, tcpMediaByLessonSlug } from "./copyrightLesson";
import { copyrightLessons } from "./copyrightLessonsQuery";
import { exportLessonsToCSV, exportToCSV } from "./csvExportHelper";
import {
  type LessonContentSchema,
  lessonBrowseDataByKsSchema,
  lessonContentSchema,
} from "./lessonOverview.schema";
import { lessonOverviewQuery } from "./lessonOverviewQuery";
import { transformOwaLessonToLessonPlan } from "./lessonTransformer";

const log = aiLogger("additional-materials");

type LessonOverviewResponse = {
  data?: {
    content?: LessonContentSchema[];
    browseData?: SyntheticUnitvariantLessonsByKs[];
  };
};

export async function POST(req: Request, res: NextApiResponse) {
  log.info("Received request to fetch OWA lesson overview");
  if (req.method !== "POST") {
    res.status(405).end("Method Not Allowed");
    return;
  }
  const AUTH_KEY = process.env.CURRICULUM_API_AUTH_KEY;
  const AUTH_TYPE = process.env.CURRICULUM_API_AUTH_TYPE;
  const GRAPHQL_ENDPOINT = process.env.CURRICULUM_API_URL;

  if (!AUTH_KEY || !AUTH_TYPE || !GRAPHQL_ENDPOINT) {
    log.error("Missing environment variables", {
      AUTH_KEY,
      AUTH_TYPE,
      GRAPHQL_ENDPOINT,
    });
    res.status(500).end("Internal Server Error");
    return;
  }

  const { lessonSlug, programmeSlug, userId } = await req.json();
  if (!userId) {
    const error = new Error("Download attempt without userId");
    const authObject = auth();
    Sentry.captureException(error, {
      level: "warning",
      extra: { authObject },
    });
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  if (!lessonSlug || !programmeSlug) {
    log.error("Missing lessonSlug or programmeSlug in request body", {
      lessonSlug,
      programmeSlug,
    });
    return Response.json(
      { error: "Missing lessonSlug or programmeSlug" },
      { status: 400 },
    );
  }

  log.info("Fetching lesson overview", {
    lessonSlug,
    programmeSlug,
  });

  try {
    const lesson = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-oak-auth-key": AUTH_KEY,
        "x-oak-auth-type": AUTH_TYPE,
      },
      body: JSON.stringify({
        query: lessonOverviewQuery,
        variables: {
          lesson_slug: lessonSlug,
          programme_slug: programmeSlug,
        },
      }),
    });

    // const copyrightLessonsResults = await fetch(GRAPHQL_ENDPOINT, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-oak-auth-key": AUTH_KEY,
    //     "x-oak-auth-type": AUTH_TYPE,
    //   },
    //   body: JSON.stringify({
    //     query: copyrightLessons,
    //   }),
    // });
    // const { data: copyrightData }: LessonOverviewResponse =
    //   await copyrightLessonsResults.json();

    // const copyrightLessonQuery = await fetch(GRAPHQL_ENDPOINT, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-oak-auth-key": AUTH_KEY,
    //     "x-oak-auth-type": AUTH_TYPE,
    //   },
    //   body: JSON.stringify({
    //     query: copyrightLesson,
    //     // variables: {
    //     //   lesson_slug: lessonSlug,
    //     // },
    //   }),
    // });

    // const { data: copyrightLessonData }: LessonOverviewResponse =
    //   await copyrightLessonQuery.json();

    // console.log("Copyright lesson data", copyrightLessonData);
    // // console.log("Copyright data", copyrightLessonData.lessons[0].features);
    // exportLessonsToCSV(copyrightLessonData.lessons);
    // const lessonTest = copyrightData?.browseData?.filter(
    //   (item) =>
    //     item.lesson_slug ===
    //     "chapter-10-henry-jekylls-full-statement-of-the-case",
    // );

    // const tcpData = await fetch(GRAPHQL_ENDPOINT, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-oak-auth-key": AUTH_KEY,
    //     "x-oak-auth-type": AUTH_TYPE,
    //   },
    //   body: JSON.stringify({
    //     query: tcpMediaByLessonSlug,
    //     variables: {
    //       lesson_slug: lessonSlug,
    //     },
    //   }),
    // });

    // if (!tcpData.ok) {
    //   log.error("Failed to fetch TCP data", {
    //     status: tcpData.status,
    //     statusText: tcpData.statusText,
    //   });
    //   return Response.json(
    //     { error: "Failed to fetch TCP data" },
    //     { status: tcpData.status },
    //   );
    // }

    // const tcpResponse = await tcpData.json();
    // console.log("TCP Response", JSON.stringify(tcpResponse));

    // const tcpMediaData =
    //   tcpResponse?.data?.mv_get_tpc_media_by_lesson_slug_1_0_0[0];
    // console.log("TCP Media Data", tcpMediaData);

    const { data }: LessonOverviewResponse = await lesson.json();

    if (!data || !data.content || data.content.length === 0) {
      log.error("No lesson data found", { data });
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (!data?.browseData || data.browseData.length === 0) {
      log.error("No browse data found", { data });
      return Response.json({ error: "Browse data not found" }, { status: 404 });
    }
    const lessonData = data?.content[0];
    const parsedLesson = lessonContentSchema.parse(lessonData);
    const browseDataArray = data?.browseData;

    const browseData = browseDataArray.filter(
      (item) => item.lesson_slug === parsedLesson.lesson_slug,
    );

    if (browseData[0] === undefined) {
      throw new Error("Lesson not found in browse data");
    }
    const restrictionResponse = checkForRestrictedFeatures(browseData[0]);
    if (restrictionResponse) {
      return restrictionResponse;
    }
    const contentGuidanceResponse = checkForRestrictedContentGuidance(
      parsedLesson.content_guidance,
    );
    if (contentGuidanceResponse) {
      return contentGuidanceResponse;
    }

    const parsedBrowseData = lessonBrowseDataByKsSchema.parse(browseData[0]);

    const transformedLesson = transformOwaLessonToLessonPlan(
      parsedLesson,
      parsedBrowseData,
    );

    log.info("Transformed owa lesson data", {
      transformedLesson,
      userId,
    });

    try {
      const interaction = await createLessonPlanInteraction(
        { userId },
        { ...transformedLesson },
      );
      const lessonId = interaction.id;
      return Response.json(
        {
          lesson: {
            ...transformedLesson,
            lessonId,
            transcript: lessonData?.transcript_sentences,
          },
        },
        { status: 200 },
      );
    } catch (interactionError) {
      log.error("Failed to create additional material interaction", {
        error: interactionError,
      });
      Sentry.captureException(interactionError);
    }
  } catch (error) {
    log.error("Unexpected error in export additional materials", { error });
    Sentry.captureException(error);
    res.status(500).end("Internal Server Error");
  }
}
