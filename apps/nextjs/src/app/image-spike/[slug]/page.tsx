import { prisma } from "@oakai/db";
import { notFound } from "next/navigation";

import { getChatById } from "@/app/actions";

import ImagesPage from "./images";

export default async function ImageTestPage({
  params,
}: {
  params: { slug: string };
}) {
  const pageData = await getChatById(params.slug);

  // if lesson plan has based on key then fetch the slug for that lesson plan

  if (!pageData) {
    notFound();
  }

  return <ImagesPage pageData={pageData} />;
}
