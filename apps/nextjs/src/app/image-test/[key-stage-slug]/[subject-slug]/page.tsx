import { auth } from "@clerk/nextjs/server";
import { prisma } from "@oakai/db";
import { redirect } from "next/navigation";

import LessonsPage from "./lessons-page";

export default async function ImageSpikePage({
  params,
}: {
  params: { "key-stage-slug": string; "subject-slug": string };
}) {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;

  if (!userId) {
    redirect("/sign-in?next=/image-test");
  }

  const keyStageSlug = params["key-stage-slug"];
  const subjectSlug = params["subject-slug"];

  console.log(`Key Stage: ${keyStageSlug}, Subject: ${subjectSlug}`);

  const lessons = await prisma.appSession.findMany({
    take: 10,
    where: {
      AND: [
        {
          output: {
            path: ["subject"],
            equals: subjectSlug,
          },
        },
        {
          output: {
            path: ["keyStage"],
            equals: keyStageSlug,
          },
        },
        {
          output: {
            path: ["lessonPlan", "exitQuiz"],
            not: {
              equals: null,
            },
          },
        },
      ],
    },
  });

  return (
    <LessonsPage
      lessons={lessons}
      keyStageSlug={keyStageSlug}
      subjectSlug={subjectSlug}
    />
  );
}
