import { mapLessonToSchema } from "@oakai/additional-materials/src/schemas";

import { notFound } from "next/navigation";

import { getOakOpenAiLessonData } from "@/app/actions";

import AdditionalMaterials from "../../AdditionalMaterials";

export default async function AdditionalMaterialsTestPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getOakOpenAiLessonData(params.slug);

  const pageData = {
    lessonPlan: mapLessonToSchema(data.lessonSummary),
    transcript:
      data.lessonTranscript.transcript ??
      "No transcript available from Oak Open ApI",
  };

  if (!pageData) {
    notFound();
  }

  return <AdditionalMaterials pageData={pageData} />;
}
