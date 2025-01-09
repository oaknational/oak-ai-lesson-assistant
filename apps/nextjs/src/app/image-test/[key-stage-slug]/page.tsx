import { auth } from "@clerk/nextjs/server";
import { prisma } from "@oakai/db";
import { redirect } from "next/navigation";

import SubjectsPage from "./subjects-page";

export default async function ImageSpikePage() {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/image-spike");
  }

  const subjects = (await prisma.subject.findMany({})).map(
    (subject) => subject.slug,
  );

  return <SubjectsPage subjects={subjects} />;
}
