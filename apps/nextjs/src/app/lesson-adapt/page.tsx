import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { serverSideFeatureFlag } from "@/utils/serverSideFeatureFlag";

export default async function LessonAdaptPage() {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;

  if (!userId) {
    redirect("/");
  }

  const isEnabled = await serverSideFeatureFlag("lesson_adapt_enabled");

  if (!isEnabled) {
    redirect("/");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Lesson Adapt</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
}
