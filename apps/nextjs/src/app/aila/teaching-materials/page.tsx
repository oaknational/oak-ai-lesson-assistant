import { aiLogger } from "@oakai/logger";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createTeachingMaterialInteraction } from "@/app/actions";
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

  log.info("Teaching materials page accessed", {
    lessonSlug,
    programmeSlug,
    docType,
    canUseOWALink,
  });

  // Default page props - the store will handle the actual data fetching
  let pageProps: TeachingMaterialsPageProps = {
    lesson: undefined,
    transcript: undefined,
    initialStep: undefined,
    docTypeFromQueryPrams: undefined,
    id: undefined,
    source: "aila",
  };

  // If we have OWA parameters and the feature flag is enabled,
  // we'll let the store handle the data fetching
  if (lessonSlug && programmeSlug && docType && canUseOWALink) {
    // Create interaction in db for teaching material
    let interactionId: string | undefined = undefined;
    try {
      const interaction = await createTeachingMaterialInteraction(
        { documentType: docType },
        { userId: userId },
      );
      interactionId = interaction.id;
    } catch (interactionError) {
      log.error("Failed to create additional material interaction", {
        error: interactionError,
      });
    }

    // Pass the query params to the view - the store will handle fetching
    pageProps = {
      source: "owa",
      initialStep: 3,
      docTypeFromQueryPrams: docType,
      id: interactionId,
      // documentType: docType,
      // Add the query params for the store to use
      queryParams: {
        lessonSlug,
        programmeSlug,
        docType,
      },
    };
  }

  return <TeachingMaterialsView {...pageProps} />;
}
