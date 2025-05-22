import { createTRPCContext } from "@oakai/api/src/context";
import { oakAppRouter } from "@oakai/api/src/router";

import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";
import { trpc } from "@/utils/trpc";

import AdditionalMaterialsView from "./AdditionalMaterialsView";

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
  let lesson = null;

  if (lessonSlug) {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:2525";
      const res = await fetch(`${baseUrl}/api/fetch-owa-lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonSlug: "sluger",
        }),
      });
      lesson = await res.json();

      console.log("res", res.json());
      // const data = await res.json();
      // console.log("data", data);
    } catch (error) {
      console.error("Failed to fetch lesson data:", error);
    }
  }

  return <AdditionalMaterialsView lessonPlan={lesson} />;
}
