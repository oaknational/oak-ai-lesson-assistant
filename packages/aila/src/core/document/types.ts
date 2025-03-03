import type { LooseLessonPlan } from "../../protocol/schema";

export type AilaDummyDocumentContent = {
  title: string;
  subject: string;
  keyStage: string;
  topic?: string;
  body: string;
};

export type AilaDocumentContent = LooseLessonPlan | AilaDummyDocumentContent;
