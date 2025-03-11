import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { notFound } from "next/navigation";
import { z } from "zod";

import AdditionalMaterials from "../../[slug]/AdditionalMaterials";

const OPEN_AI_AUTH_TOKEN = process.env.OPEN_AI_AUTH_TOKEN;

const lessonSchema = z.object({
  lessonTitle: z.string(),
  unitSlug: z.string(),
  unitTitle: z.string(),
  subjectSlug: z.string(),
  subjectTitle: z.string(),
  keyStageSlug: z.string(),
  keyStageTitle: z.string(),
  lessonKeywords: z.array(
    z.object({
      keyword: z.string(),
      description: z.string(),
    }),
  ),
  keyLearningPoints: z.array(
    z.object({
      keyLearningPoint: z.string(),
    }),
  ),
  misconceptionsAndCommonMistakes: z.array(
    z.object({
      misconception: z.string(),
      response: z.string(),
    }),
  ),
  pupilLessonOutcome: z.string(),
  teacherTips: z.array(
    z.object({
      teacherTip: z.string(),
    }),
  ),
  contentGuidance: z.array(z.object({}).passthrough()).nullish(),
  supervisionLevel: z.string().nullable(),
  downloadsAvailable: z.boolean(),
});

type Lesson = z.infer<typeof lessonSchema>;

const transcriptSchema = z.object({
  transcript: z.string().nullish(),
  vtt: z.string().nullish(),
});

export function mapLessonToSchema(lessonData: Lesson): LooseLessonPlan {
  return {
    title: lessonData.lessonTitle,
    keyStage: lessonData.keyStageSlug,
    subject: lessonData.subjectTitle,
    topic: lessonData.unitTitle,
    learningOutcome: lessonData.pupilLessonOutcome,
    learningCycles: [],
    priorKnowledge: [],
    keyLearningPoints: lessonData.keyLearningPoints.map(
      (point) => point.keyLearningPoint,
    ),
    misconceptions: lessonData.misconceptionsAndCommonMistakes.map(
      (misconception) => {
        return {
          misconception: misconception.misconception,
          description: misconception.response,
        };
      },
    ),
    keywords: lessonData.lessonKeywords.map((keyword) => {
      return {
        keyword: keyword.keyword,
        definition: keyword.description,
      };
    }),
    basedOn: undefined,
    starterQuiz: [],
    cycle1: {},
    cycle2: {},
    cycle3: {},
    exitQuiz: [],
    additionalMaterials: "",
  };
}

export default async function ImageTestPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!OPEN_AI_AUTH_TOKEN) {
    throw new Error("No OpenAI auth token found");
  }

  const responseSummary = await fetch(
    `https://open-api.thenational.academy/api/v0/lessons/${params.slug}/summary`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${OPEN_AI_AUTH_TOKEN}`,
        Accept: "application/json",
      },
    },
  );
  const responseTranscript = await fetch(
    `https://open-api.thenational.academy/api/v0/lessons/${params.slug}/transcript`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${OPEN_AI_AUTH_TOKEN}`,
        Accept: "application/json",
      },
    },
  );

  const summaryData = lessonSchema.parse(await responseSummary.json());
  const transcriptData = transcriptSchema.parse(
    await responseTranscript.json(),
  );
  const pageData = {
    lessonPlan: mapLessonToSchema(summaryData),
    transcript:
      transcriptData.transcript ?? "No transcript available from Oak Open ApI",
  };

  if (!pageData) {
    notFound();
  }

  return <AdditionalMaterials pageData={pageData} />;
}
