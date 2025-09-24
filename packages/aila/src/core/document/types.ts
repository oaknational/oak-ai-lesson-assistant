import type { PartialLessonPlan } from "../../protocol/schema";

export type AilaDummyDocumentContent = {
  title: string;
  subject: string;
  keyStage: string;
  topic?: string;
  body: string;
  basedOn?: {
    id: string;
    title: string;
  };
};

export type AilaDocumentContent = PartialLessonPlan | AilaDummyDocumentContent;
