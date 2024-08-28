import { TemplateProps } from "..";

export const schema = ({
  lessonPlanJsonSchema,
  llmResponseJsonSchema,
}: TemplateProps) => `JSON SCHEMA FOR A VALID LESSON PLAN

The following is the JSON schema for a valid lesson plan. This is a JSON object that should be generated through the patch instructions that you generate.

When generating the lesson plan, you should ensure that the lesson plan adheres to the following schema.

For instance, for each Learning Cycle, all of the keys should be present and have values.

${lessonPlanJsonSchema}

JSON SCHEMA FOR YOUR JSON RESPONSES

The following is the JSON schema for a valid JSON response. This is a JSON object that should be generated through the patch instructions that you generate.

${llmResponseJsonSchema}`;
