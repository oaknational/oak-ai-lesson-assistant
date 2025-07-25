import { aiLogger } from "@oakai/logger";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import TeachingMaterialsView, {
  type TeachingMaterialsPageProps,
} from "./teachingMaterialsView";

const log = aiLogger("additional-materials");

export default async function AdditionalMaterialsTestPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }
  const canUseOWALink = await serverSideFeatureFlag("additional-materials");

  const lessonSlug = searchParams?.lessonSlug;
  const programmeSlug = searchParams?.programmeSlug;
  const docType = searchParams?.docType;

  let pageProps: TeachingMaterialsPageProps = {
    source: "aila",
  };

  if (lessonSlug && programmeSlug && docType && canUseOWALink) {
    pageProps = {
      source: "owa",
      initialStep: 3,
      queryParams: {
        lessonSlug,
        programmeSlug,
        docType,
      },
    };
  }

  return <TeachingMaterialsView {...pageProps} />;
}
