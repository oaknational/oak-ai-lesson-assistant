import { prisma } from "@oakai/db";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import LessonFinder from "./LessonFinder";

export default async function ImageSpikePage() {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/image-spike");
  }
  const lessons = await prisma.appSession.findMany({
    where: {
      userId: userId,
    },
  });

  return <LessonFinder lessons={lessons} />;
}
