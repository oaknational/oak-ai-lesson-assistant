import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import TeachingMaterialsView, {
  type TeachingMaterialsPageProps,
} from "./teachingMaterialsView";

export default async function TeachingMaterialsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const clerkAuthentication = await auth();
  const resolvedSearchParams = await searchParams;
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }

  const lessonSlug = resolvedSearchParams?.lessonSlug;
  const programmeSlug = resolvedSearchParams?.programmeSlug;
  const docType = resolvedSearchParams?.docType;

  let pageProps: TeachingMaterialsPageProps = {
    source: "aila",
  };

  if (lessonSlug && docType) {
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
