import type { PrismaClientWithAccelerate } from "@oakai/db";

import { kv } from "@vercel/kv";

import type { LooseLessonPlan } from "../../protocol/schema";
import { fetchLessonPlanContentById } from "./fetchLessonPlanContentById";

export async function fetchLessonPlan({
  id,
  deleteCache = process.env["NODE_ENV"] === "development",
  prisma,
}: {
  id?: string;
  deleteCache?: boolean;
  prisma: PrismaClientWithAccelerate;
}) {
  if (!id) {
    return null;
  }
  if (deleteCache) {
    await kv.del(`chat:lessonPlan:${id}`);
  }
  const cachedLesson = await kv.get<LooseLessonPlan>(`chat:lessonPlan:${id}`);
  if (cachedLesson) {
    return cachedLesson;
  }
  const content = await fetchLessonPlanContentById(id, prisma);
  if (content) {
    await kv.set<LooseLessonPlan>(`chat:lessonPlan:${id}`, content, {
      ex: 5 * 60,
    });
  }

  return content;
}
