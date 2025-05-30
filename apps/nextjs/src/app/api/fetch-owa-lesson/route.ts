import { aiLogger } from "@oakai/logger";

import { type SyntheticUnitvariantLessonsByKs } from "@oaknational/oak-curriculum-schema";
import * as Sentry from "@sentry/node";
import type { NextApiResponse } from "next";

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

  const { lessonSlug, programmeSlug } = await req.json();
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
    const browseData = data?.browseData[0];

    const parsedLesson = lessonContentSchema.parse(lessonData);
    const parsedBrowseData = lessonBrowseDataByKsSchema.parse(browseData);

    const transformedLesson = transformOwaLessonToLessonPlan(
      parsedLesson,
      parsedBrowseData,
    );

    return Response.json(
      {
        lesson: transformedLesson,
        transcript: lessonData?.transcript_sentences,
      },
      { status: 200 },
    );
  } catch (error) {
    log.error("Unexpected error in export additional materials", { error });
    Sentry.captureException(error);
    res.status(500).end("Internal Server Error");
  }
}
