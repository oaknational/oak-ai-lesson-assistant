import { TemplateProps } from "..";

export const currentLessonPlan = ({
  lessonPlan,
}: TemplateProps) => `THE CURRENT LESSON PLAN
This is where we have got to with the lesson plan so far.
This represents the state of the application at the moment, as a JSON document.
Use this as the basis for making any changes to the lesson plan.
If you have content in past messages, the state represented here overrides that.
${JSON.stringify(lessonPlan, null, 2)}`;
