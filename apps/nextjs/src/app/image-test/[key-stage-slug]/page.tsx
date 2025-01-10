import { auth } from "@clerk/nextjs/server";
import { prisma } from "@oakai/db";
import { redirect } from "next/navigation";

import SubjectsPage from "./subjects-page";

export default async function ImageSpikePage({
  params,
}: {
  params: { "key-stage-slug": string };
}) {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/image-spike");
  }
  const keyStageSlug = params["key-stage-slug"];

  const keyStageSubject = await prisma.keyStageSubject.findMany({
    select: {
      keyStage: true,
      subject: true,
    },
    where: {
      keyStage: {
        slug: keyStageSlug,
      },
    },
  });

  const subjects = keyStageSubject.map((subject) => subject.subject.slug);

  return <SubjectsPage subjects={subjects} />;
}
