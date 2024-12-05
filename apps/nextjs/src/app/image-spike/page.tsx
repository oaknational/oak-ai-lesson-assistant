import { auth } from "@clerk/nextjs/server";
import { prisma } from "@oakai/db";
import { redirect } from "next/navigation";

import ImageSpike from "./image-spike";

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

  return <ImageSpike lessons={lessons} />;
}
