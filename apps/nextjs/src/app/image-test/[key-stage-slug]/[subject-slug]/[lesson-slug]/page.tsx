import { auth } from "@clerk/nextjs/server";
import { prisma } from "@oakai/db";
import { redirect } from "next/navigation";

import { getChatById } from "@/app/actions";

import ImageTestPage from "./test-page";

export default async function ImageSpikePage({
  params,
}: {
  params: {
    "key-stage-slug": string;
    "subject-slug": string;
    "lesson-slug": string;
  };
}) {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;

  if (!userId) {
    redirect("/sign-in?next=/image-test");
  }

  const keyStageSlug = params["key-stage-slug"];
  const subjectSlug = params["subject-slug"];
  const lessonId = params["lesson-slug"];

  console.log(`Key Stage: ${keyStageSlug}, Subject: ${subjectSlug}`);

  const lesson = await prisma.appSession.findFirst({
    where: {
      id: lessonId,
    },
  });
  const pageData = await getChatById(lessonId);
  // @ts-ignore
  return <ImageTestPage lesson={lesson} pageData={pageData} />;
}
