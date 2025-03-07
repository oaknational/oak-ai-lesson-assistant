import { prisma } from "@oakai/db";
import { notFound } from "next/navigation";

import { getChatById } from "@/app/actions";

import AdditionalMaterials from "../../[slug]/AdditionalMaterials";

const OPEN_AI_AUTH_TOKEN = process.env.OPEN_AI_AUTH_TOKEN;

export function mapLessonToSchema(lessonData) {
  return {
    title: lessonData.lessonTitle,
    keyStage: lessonData.keyStageSlug,
    subject: lessonData.subjectTitle,
    topic: undefined,
    learningOutcome: lessonData.pupilLessonOutcome,
    learningCycles: [], // You may need to define learning cycles from the given data
    priorKnowledge: [], // Define any relevant prior knowledge
    keyLearningPoints: lessonData.keyLearningPoints,
    misconceptions: lessonData.misconceptionsAndCommonMistakes,
    keywords: lessonData.lessonKeywords,
    basedOn: undefined, // Optional field, assign if necessary
    starterQuiz: [], // Define quiz structure
    cycle1: {}, // Define first learning cycle
    cycle2: {}, // Define second learning cycle
    cycle3: {}, // Define third learning cycle
    exitQuiz: [], // Define quiz structure
    scienceAdditionalMaterials: {},
    additionalMaterials: [], // Define additional materials as needed
  };
}

export default async function ImageTestPage({
  params,
}: {
  params: { slug: string };
}) {
  const lessonSlug = "joining-using-and";

  if (!OPEN_AI_AUTH_TOKEN) {
    throw new Error("No OpenAI auth token found");
  }

  const response = await fetch(
    `https://open-api.thenational.academy/api/v0/lessons/${params.slug}/summary`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${OPEN_AI_AUTH_TOKEN}`,
        Accept: "application/json",
      },
    },
  );

  const data = await response.json();
  const pageData = { lessonPlan: mapLessonToSchema(data) };
  console.log("data", pageData);

  // if lesson plan has based on key then fetch the slug for that lesson plan

  if (!pageData) {
    notFound();
  }

  return <AdditionalMaterials pageData={pageData} />;
}
