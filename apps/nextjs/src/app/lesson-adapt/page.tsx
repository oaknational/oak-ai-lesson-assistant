import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

import LessonAdaptView from "./LessonAdaptView";

export default async function LessonAdaptPageServer() {
  const clerkAuthentication = await auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }

  const isEnabled = await serverSideFeatureFlag("lesson_adapt_enabled");
  if (!isEnabled) {
    redirect("/");
  }

  return <LessonAdaptView />;
}
