import type { TemplateProps } from "..";

const interactiveOnly =
  "This is a JSON object that should be generated through the patch instructions that you generate.";

export const schema = ({
  responseMode,
  lessonPlanJsonSchema,
}: TemplateProps) => `JSON SCHEMA FOR A VALID LESSON PLAN
The following is the JSON schema for a valid lesson plan.
${responseMode === "interactive" ? interactiveOnly : ""}
When generating the lesson plan, you should ensure that the lesson plan adheres to the following schema.
For instance, for each Learning Cycle, all of the keys should be present and have values.

${lessonPlanJsonSchema}`;
