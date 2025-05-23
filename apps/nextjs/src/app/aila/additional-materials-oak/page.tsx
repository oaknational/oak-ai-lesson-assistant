import { LessonPlanSchemaWhilstStreaming } from "@oakai/aila/src/protocol/schema";
import { AdditionalMaterialsUserProps } from "@oakai/aila/src/protocol/schema";
import { createTRPCContext } from "@oakai/api/src/context";
import { oakAppRouter } from "@oakai/api/src/router";

import { redirect } from "next/navigation";

import { AdditionalMaterials } from "@/components/AppComponents/Chat/lesson-plan-section/index.stories";
import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";
import { trpc } from "@/utils/trpc";

import AdditionalMaterialsView, {
  type AdditionalMaterialsPageProps,
} from "./AdditionalMaterialsView";

export default async function AdditionalMaterialsTestPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const canSeeAM = await serverSideFeatureFlag("additional-materials");

  if (!canSeeAM) {
    redirect("/");
  }

  const lessonSlug = searchParams?.lessonSlug || "lesson-slug";
  let pageProps: AdditionalMaterialsPageProps = {
    lesson: undefined,
    transcript: undefined,
    initialStep: undefined,
    docTypeFromQueryPrams: undefined,
  };

  if (lessonSlug) {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2525";
      console.log("baseUrl", baseUrl);
      const res = await fetch(`${baseUrl}/api/fetch-owa-lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonSlug: "sluger",
        }),
      });
      const { lesson, transcript } = await res.json();

      const parsedLesson = LessonPlanSchemaWhilstStreaming.parse(lesson);

      pageProps = {
        lesson: parsedLesson,
        transcript: transcript,
        initialStep: 2,
        docTypeFromQueryPrams: "additional-glossary",
      };

      console.log("pageProps", pageProps);

      // console.log("res", res.json());
      // const data = await res.json();
      // console.log("lesson fetched", lesson);
      // console.log("lesson fetched", transcript);
    } catch (error) {
      console.error("Failed to fetch lesson data:", error);
    }
  }

  return <AdditionalMaterialsView {...pageProps} />;
}
