import { prisma } from "@oakai/db";
import { notFound } from "next/navigation";

import { getChatById } from "@/app/actions";

import AdditionalMaterials from "./AdditionalMaterials";

const OPEN_AI_AUTH_TOKEN = process.env.OPEN_AI_AUTH_TOKEN;

export default async function ImageTestPage({
  params,
}: {
  params: { slug: string };
}) {
  const pageData = await getChatById(params.slug);

  const lessonSlug = "joining-using-and";

  if (!OPEN_AI_AUTH_TOKEN) {
    throw new Error("No OpenAI auth token found");
  }

  try {
    const response = await fetch(
      `https://open-api.thenational.academy/api/v0/lessons/${lessonSlug}/summary`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${OPEN_AI_AUTH_TOKEN}`,
          Accept: "application/json",
        },
      },
    );

    const data = await response.json();

    console.log("data", data);
  } catch (e) {
    console.log(e);
  }

  // if lesson plan has based on key then fetch the slug for that lesson plan

  if (!pageData) {
    notFound();
  }

  return <AdditionalMaterials pageData={pageData} />;
}
