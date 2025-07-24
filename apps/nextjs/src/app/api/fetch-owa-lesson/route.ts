import { aiLogger } from "@oakai/logger";

import { auth } from "@clerk/nextjs/server";
import { type SyntheticUnitvariantLessonsByKs } from "@oaknational/oak-curriculum-schema";
import * as Sentry from "@sentry/node";
import type { NextApiResponse } from "next";

import { createLessonPlanInteraction } from "@/app/actions";

import { checkForRestrictedContentGuidance } from "./copyrightCheckHelper";
import {
  exportRestrictedContentGuidanceLessonsToCSV,
  exportTCPWorksToCSV,
} from "./csvExportHelper";
import {
  type LessonContentSchema,
  lessonBrowseDataByKsSchema,
  lessonContentSchema,
} from "./lessonOverview.schema";
import {
  lessonOverviewQuery,
  lessonsWithRestrictedContentQuery,
} from "./lessonOverviewQuery";
import { transformOwaLessonToLessonPlan } from "./lessonTransformer";
import { tcpWorks, tcpWorksByLessonSlug } from "./tpcWorksByLessonSlugQuery";

const log = aiLogger("additional-materials");

type LessonOverviewResponse = {
  data?: {
    content?: LessonContentSchema[];
    browseData?: SyntheticUnitvariantLessonsByKs[];
  };
};

type TRPCWorksResponse = {
  data?: {
    tcpWorksByLessonSlug?: {
      slug: string;
      lesson_id: number;
      works_list: {
        title: string;
        author?: string;
        works_id: number;
        works_uid: string;
        attribution?: string;
        restriction_level: string;
        tpc_contracts_list: number[];
        [key: string]: any;
      }[];
    }[];
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
    // const guidanceLessons = await fetch(GRAPHQL_ENDPOINT, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-oak-auth-key": AUTH_KEY,
    //     "x-oak-auth-type": AUTH_TYPE,
    //   },
    //   body: JSON.stringify({
    //     query: lessonsWithRestrictedContentQuery,
    //   }),
    // });

    // const { data: guidanceData }: LessonOverviewResponse =
    //   await guidanceLessons.json();

    // if (!guidanceData || !guidanceData.content) {
    //   log.error("No guidance lessons data found", { guidanceData });
    //   return Response.json(
    //     { error: "No guidance lessons data found" },
    //     { status: 404 },
    //   );
    // }
    // console.log("Guidance data fetched", {
    //   guidanceData: JSON.stringify(guidanceData, null, 2),
    // });

    // exportRestrictedContentGuidanceLessonsToCSV(guidanceData?.content ?? []);

    // const tcpWorksAllData = await fetch(GRAPHQL_ENDPOINT, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "x-oak-auth-key": AUTH_KEY,
    //     "x-oak-auth-type": AUTH_TYPE,
    //   },
    //   body: JSON.stringify({
    //     query: tcpWorks,
    //   }),
    // });

    // if (!tcpWorksAllData.ok) {
    //   log.error("Failed to fetch TCP data", {
    //     status: tcpWorksAllData.status,
    //     statusText: tcpWorksAllData.statusText,
    //   });
    //   return Response.json(
    //     { error: "Failed to fetch TCP data" },
    //     { status: tcpWorksAllData.status },
    //   );
    // }

    // const tcpResponseAll: TRPCWorksResponse = await tcpWorksAllData.json();

    // const worksListAll = tcpResponseAll;

    // log.info(
    //   `TCP works data fetched - has restricted works: ${worksListAll}`,
    // );

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

    const tcpData = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-oak-auth-key": AUTH_KEY,
        "x-oak-auth-type": AUTH_TYPE,
      },
      body: JSON.stringify({
        query: tcpWorksByLessonSlug,
        variables: {
          lesson_slug: lessonSlug,
        },
      }),
    });

    if (!tcpData.ok) {
      log.error("Failed to fetch TCP data", {
        status: tcpData.status,
        statusText: tcpData.statusText,
      });
      return Response.json(
        { error: "Failed to fetch TCP data" },
        { status: tcpData.status },
      );
    }

    const tcpResponse = await tcpData.json();

    const tcpWorksData: TRPCWorksResponse = tcpResponse;

    const worksList =
      tcpWorksData.data?.tcpWorksByLessonSlug?.[0]?.works_list ?? [];
    const hasRestrictedWorks = worksList.length > 0;

    log.info(
      `TCP works data fetched - has restricted works: ${hasRestrictedWorks}`,
    );
    log.info("TCP works data", {
      tcpWorksData: JSON.stringify(tcpWorksData),
      lessonSlug,
      programmeSlug,
    });

    const { data }: LessonOverviewResponse = await lesson.json();

    if (!data || !data.content || data.content.length === 0) {
      log.error("No lesson data found", { data });
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (!data?.browseData || data.browseData.length === 0) {
      log.error("No browse data found", { data });
      return Response.json({ error: "Browse data not found" }, { status: 404 });
    }
    // exportTCPWorksToCSV(worksListAll, data);
    const lessonData = data?.content[0];
    const parsedLesson = lessonContentSchema.parse(lessonData);
    const browseDataArray = data?.browseData;

    const browseData = browseDataArray.filter(
      (item) => item.lesson_slug === parsedLesson.lesson_slug,
    );

    if (browseData[0] === undefined) {
      throw new Error("Lesson not found in browse data");
    }
    // const restrictionResponse = checkForRestrictedFeatures(browseData[0]);
    // if (restrictionResponse) {
    //   return restrictionResponse;
    // }
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
      log.info("Creating lesson plan interaction");
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
            transcript: !hasRestrictedWorks // We are excluding any transcripts that may have tpc restricted works
              ? lessonData?.transcript_sentences
              : undefined,
            hasRestrictedWorks,
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
