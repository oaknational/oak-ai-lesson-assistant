import { mapOpenApiLessonToAilaLesson } from "@oakai/additional-materials/src/helpers";

import { notFound, redirect } from "next/navigation";

import { getOakOpenAiLessonData } from "@/app/actions";
import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import AdditionalMaterials from "../../AdditionalMaterials";

export default async function AdditionalMaterialsTestPage({
  params,
}: {
  params: { slug: string };
}) {
  const canSeeAM = await serverSideFeatureFlag("additional-materials");

  if (!canSeeAM) {
    redirect("/");
  }
  const data = await getOakOpenAiLessonData(params.slug);

  const pageData = {
    lessonPlan: mapOpenApiLessonToAilaLesson(data.lessonSummary),
    transcript:
      data.lessonTranscript.transcript ??
      "No transcript available from Oak Open ApI",
  };

  if (!pageData) {
    notFound();
  }

  return <AdditionalMaterials pageData={pageData} />;
}
