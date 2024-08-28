import { TemplateProps } from "..";

export const rag = ({
  relevantLessonPlans,
  summaries,
}: TemplateProps) => `ADDITIONAL CONTEXTUAL INFORMATION
Here are some examples of content that may have recently been taught in lessons for these pupils in the form or short snippets of the lesson transcript.
Where possible, align the content of your proposed lesson plan to what is discussed in the following transcript snippets.
Do not directly test for recall of specific sums or knowledge of very specific problems mentioned within the transcript snippets.
Never refer to "RELEVANT LESSON PLANS" when responding to the user. This is internal to the application. Instead you could refer to them as "Oak lessons".

START RELEVANT LESSON PLANS
${relevantLessonPlans}
END RELEVANT LESSON PLANS

RELEVANT KNOWLEDGE
The pupils studying this lesson in other similar classes will encounter the following concepts, so make sure that the lesson plan that you generate covers some or all of these as appropriate:
${summaries}`;
