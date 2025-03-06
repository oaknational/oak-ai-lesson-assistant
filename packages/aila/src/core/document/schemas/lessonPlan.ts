import type { z } from "zod";

import { LessonPlanSchemaWhilstStreaming } from "../../../protocol/schema";

export const LessonPlanSchema = LessonPlanSchemaWhilstStreaming;

export type AilaLessonPlanContent = z.infer<typeof LessonPlanSchema>;
