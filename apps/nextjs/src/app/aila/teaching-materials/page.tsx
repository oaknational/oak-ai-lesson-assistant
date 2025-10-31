import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import TeachingMaterialsView, {
  type TeachingMaterialsPageProps,
} from "./teachingMaterialsView";

export default function TeachingMaterialsTestPage({
  searchParams,
}: {
  readonly searchParams: { [key: string]: string | undefined };
}) {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }

  const lessonSlug = searchParams?.lessonSlug;
  const programmeSlug = searchParams?.programmeSlug;
  const docType = searchParams?.docType;

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
