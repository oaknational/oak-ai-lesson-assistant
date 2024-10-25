import { LooseLessonPlan } from "../../protocol/schema";

export type AmericanismIssueBySection = {
  section: string;
  issues: AmericanismIssue[];
};

export type AmericanismIssue = {
  phrase: string;
  issue?: string;
  details?: string;
};

export interface AilaAmericanismsFeature {
  findAmericanisms(lessonPlan: LooseLessonPlan): AmericanismIssueBySection[];
}
