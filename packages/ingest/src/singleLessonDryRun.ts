import { CompletedLessonPlanSchemaWithoutLength } from "@oakai/aila/src/protocol/schema";
import fs from "node:fs";
import path from "node:path";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { dirname } from "path";
import { fileURLToPath } from "url";

import { getCaptionsByFileName } from "./captions/getCaptionsByFileName";
import { getCaptionsFileNameForLesson } from "./captions/getCaptionsFileNameForLesson";
import { getSystemPrompt } from "./generate-lesson-plans/getSystemPrompt";
import { getUserPrompt } from "./generate-lesson-plans/getUserPrompt";
import { graphqlClient } from "./import-lessons/graphql/client";
import {
  query,
  type QueryVariables,
  type QueryWhere,
} from "./import-lessons/graphql/query";
import { openai } from "./openai-batches/openai";
import { type RawLesson, RawLessonSchema } from "./zod-schema/zodSchema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

void singleLessonDryRun();

async function singleLessonDryRun() {
  try {
    const rawLesson = await fetchAndParseLesson();
    const fileName = getCaptionsFileNameForLesson({
      videoTitle: rawLesson.videoTitle,
    });
    const { caption: captions } = await getCaptionsByFileName(fileName);
    // @todo check if transcript?
    const systemPrompt = getSystemPrompt({ rawLesson });
    const userPrompt = getUserPrompt({
      rawLesson,
      sourcePartsToInclude: "all",
      captions,
    });

    const responseFormat = zodResponseFormat(
      CompletedLessonPlanSchemaWithoutLength,
      "lesson_plan",
    );

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: responseFormat,
    });

    const lessonPlan = completion?.choices?.[0]?.message.parsed;

    if (!lessonPlan) {
      console.log(completion);
      throw new Error("Failed to generate lesson plan");
    }

    const DIR = path.join(__dirname, `_data/output/${rawLesson.lessonSlug}`);

    // make a folder for the lesson
    fs.mkdirSync(DIR, { recursive: true });
    // make a file for the lesson
    fs.writeFileSync(
      path.join(DIR, `lesson.json`),
      JSON.stringify(rawLesson, null, 2),
    );
    // make a file for each prompt
    fs.writeFileSync(path.join(DIR, `systemPrompt.txt`), systemPrompt);
    fs.writeFileSync(path.join(DIR, `userPrompt.txt`), userPrompt);
    // make a file for the lesson plan
    fs.writeFileSync(
      path.join(DIR, `lessonPlan.json`),
      JSON.stringify(lessonPlan, null, 2),
    );
  } catch (cause) {
    console.log(cause);
    throw new Error("Single lesson dry run failed", { cause });
  }
}

async function fetchAndParseLesson(): Promise<RawLesson> {
  const where: QueryWhere = {
    // videoTitle: {
    //   _is_null: false,
    // },
    // isLegacy: {
    //   _is_null: true,
    // },
    lessonSlug: {
      _eq: "mansa-musas-pilgrimage",
    },
  };
  const lessonData = await graphqlClient.request<
    { lessons: unknown[] },
    QueryVariables
  >(query, { limit: 1, offset: 0, where });

  const [lesson] = lessonData.lessons;

  try {
    return RawLessonSchema.parse(lesson);
  } catch (cause) {
    throw new Error("Failed to parse lesson", { cause });
  }
}
