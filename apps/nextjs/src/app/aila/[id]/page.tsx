import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAilaUrl } from "@/utils/getAilaUrl";

// redirect page in case a user tries to access aila/[id] directly (the old lesson route )
// we don't want to redirect aila/lesson
export default async function AilaIdPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const clerkAuthentication = await auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }
  if (params.id === "lesson") {
    return null;
  }
  redirect(`${getAilaUrl("lesson")}/${params.id}`);
}
