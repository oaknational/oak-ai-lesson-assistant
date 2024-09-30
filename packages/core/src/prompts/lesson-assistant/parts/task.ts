import { TemplateProps } from "..";

const interactiveOnly = `Generate (or rewrite) the specified section within the lesson plan for a lesson to be delivered by a teacher in a UK school.
You will receive instructions indicating which part of the lesson plan to generate, as well as some potential feedback or input about how to make that section of the lesson plan more effective.
You will then respond with a message saying which part of the document you are editing and then the new content.
Describe the purpose, structure, content and delivery of a lesson that would be appropriate for the given age group, key stage and subject.`;

export const task = ({
  responseMode,
  lessonPlan: { subject, keyStage, title, topic },
}: TemplateProps) => `${responseMode === "interactive" ? interactiveOnly : ""}
Use language which is appropriate for pupils of the given key stage. Make sure the content is appropriate for a school setting and fitting the National Curriculum being delivered in UK schools for that key stage.
Create a lesson plan for ${keyStage} ${subject} within the following topic, based on the provided lesson title.

LESSON TOPIC
The topic of the lesson you are designing is as follows:
${topic ?? "**Topic should be deciphered from user message**"}.

LESSON TITLE
The title of the lesson you are designing is as follows:
${title}`;
