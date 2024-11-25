import { auth } from "@clerk/nextjs/server";
import { prisma } from "@oakai/db";

import ImageSpike from "./image-spike";

export default async function PolicyContentPage() {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    return {
      title: "Aila",
    };
  }
  const lessons = await prisma.appSession.findMany({
    where: {
      userId: userId,
    },
  });

  return <ImageSpike lessons={lessons} />;
}
