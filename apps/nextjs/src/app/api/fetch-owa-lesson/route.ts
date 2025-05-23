import { additionalMaterialTypeEnum } from "@oakai/additional-materials/src/documents/additionalMaterials/configSchema";
import { transformDataForExport } from "@oakai/additional-materials/src/documents/additionalMaterials/dataHelpers/transformDataForExports";
import { exportAdditionalResourceDoc } from "@oakai/exports/src/exportAdditionalResourceDoc";
import { aiLogger } from "@oakai/logger";

import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  type SyntheticUnitvariantLessonsByKs,
  lessonEquipmentAndResourcesSchema,
  syntheticUnitvariantLessonsByKsSchema,
} from "@oaknational/oak-curriculum-schema";
import {
  lessonContentSchema as lessonContentSchemaFull,
  syntheticUnitvariantLessonsSchema,
} from "@oaknational/oak-curriculum-schema";
import * as Sentry from "@sentry/node";
import type { NextApiResponse } from "next";

import { nodePassThroughToReadableStream } from "../aila-download/downloadHelpers";
import { getDriveDocsZipStream } from "./helpers";
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

  // const query = `
  //   query lessonOverview($lesson_slug: String!) {
  //       lessons: published_mv_lesson_content_published_5_0_0(
  //           where: { lesson_slug: { _eq: $lesson_slug } }
  //       ) {
  //           lesson_id
  //   lesson_title
  //   lesson_slug
  //   deprecated_fields
  //   is_legacy
  //   misconceptions_and_common_mistakes
  //   equipment_and_resources
  //   teacher_tips
  //   key_learning_points
  //   pupil_lesson_outcome
  //   phonics_outcome
  //   lesson_keywords
  //   content_guidance
  //   video_mux_playback_id
  //   video_id
  //   video_with_sign_language_mux_playback_id
  //   transcript_sentences
  //   starter_quiz
  //   starter_quiz_id
  //   exit_quiz
  //   exit_quiz_id
  //   supervision_level
  //   video_title
  //   has_worksheet_google_drive_downloadable_version
  //   has_slide_deck_asset_object
  //   worksheet_asset_id
  //   has_worksheet_asset_object
  //   worksheet_answers_asset_id
  //   has_worksheet_answers_asset_object
  //   supplementary_asset_id
  //   has_supplementary_asset_object
  //   slide_deck_asset_id
  //   slide_deck_asset_object_url
  //   worksheet_asset_object_url
  //   supplementary_asset_object_url
  //   has_lesson_guide_google_drive_downloadable_version
  //   lesson_guide_asset_object_url
  //   has_lesson_guide_object
  //   lesson_guide_asset_id

  //       }
  //   }
  //   `;

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
          lesson_slug: "features-of-a-poster",
          programme_slug: "computing-secondary-ks3",
        },
      }),
    });

    const { data }: LessonOverviewResponse = await lesson.json();
    console.log("all the data", data);
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

    console.log("lessonData", lessonData);
    console.log("browseData", browseData);

    const parsedLesson = lessonContentSchema.parse(lessonData);
    const parsedBrowseData = lessonBrowseDataByKsSchema.parse(browseData);

    const transformedLesson = transformOwaLessonToLessonPlan(
      parsedLesson,
      parsedBrowseData,
    );

    console.log("transformed", transformedLesson);

    return Response.json(
      {
        lesson: transformedLesson,
        transcript: lessonData?.transcript_sentences,
      },
      { status: 200 },
    );
    // res.status(200).json(lesson);
  } catch (error) {
    log.error("Unexpected error in export additional materials", { error });
    Sentry.captureException(error);
    res.status(500).end("Internal Server Error");
  }
}
