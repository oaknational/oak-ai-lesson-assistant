import { auth } from "@clerk/nextjs/server";
import { prisma } from "@oakai/db";
import { redirect } from "next/navigation";

import ImageTest from "./image-test";

export default async function ImageSpikePage() {
  const clerkAuthentication = auth();
  const { userId }: { userId: string | null } = clerkAuthentication;
  if (!userId) {
    redirect("/sign-in?next=/image-spike");
  }
  //   const lessons = await prisma.appSession.findMany({
  //     where: {
  //       userId: userId,
  //     },
  //   });

  const keyStages = (await prisma.keyStage.findMany({}))
    .map((keyStage) => keyStage.slug)
    .sort();

  console.log(keyStages);

  return <ImageTest keyStages={keyStages} />;
}
