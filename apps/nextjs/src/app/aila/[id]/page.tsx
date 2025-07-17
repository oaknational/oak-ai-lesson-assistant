import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAilaUrl } from "@/utils/getAilaUrl";

// redirect page in case a user tries to access aila/[id] directly (the old lesson route )
// we don't want to redirect aila/lesson
export default function AilaIdPage({ params }: { params: { id: string } }) {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/aila");
  }
  if (params.id === "lesson") {
    return null;
  }
  redirect(`${getAilaUrl("lesson")}/${params.id}`);
}
