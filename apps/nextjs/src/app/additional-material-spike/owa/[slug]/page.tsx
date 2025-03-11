import { notFound } from "next/navigation";

import {
  lessonSchema,
  mapLessonToSchema,
  transcriptSchema,
} from "../../../../../../../packages/additional-materials/src/schemas";
import AdditionalMaterials from "../../[slug]/AdditionalMaterials";

const OPEN_AI_AUTH_TOKEN = process.env.OPEN_AI_AUTH_TOKEN;

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
