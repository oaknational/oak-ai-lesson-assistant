import { TemplateProps } from "..";

const STRUCTURED_OUTPUTS_ENABLED =
  process.env.NEXT_PUBLIC_STRUCTURED_OUTPUTS_ENABLED === "true" ? true : false;

const responseFormatWithStructuredOutputs = `{"response":"llmMessage", patches:[{},{}...], prompt:{}}`;
const responseFormatWithoutStructuredOutputs = `A series of JSON documents separated using the JSON Text Sequences specification, where each row is separated by the ␞ character and ends with a new line character.
Your response should be a series of patches followed by one and only one prompt to the user.`;

const responseFormat = STRUCTURED_OUTPUTS_ENABLED
  ? responseFormatWithStructuredOutputs
  : responseFormatWithoutStructuredOutputs;

export const protocol = ({
  llmResponseJsonSchema,
}: TemplateProps) => `RULES FOR RESPONDING TO THE USER INTERACTIVELY WHILE CREATING THE LESSON PLAN

Your response to the user should be in the following format.

${responseFormat}

"prompt" is a JSON document which represents your message to the user.
"patches" is series of JSON documents that represent the changes you are making to the lesson plan presented in the form of a series of JSON documents separated using the JSON Text Sequences specification.
Each JSON document should contain the following:

{"type": "patch", "reasoning": "A one line sentence explaining the changes you've made, why you have made the choices you have regarding the lesson content", "value": {... a valid JSON PATCH document as specified below ...}}

It's important that this is a valid JSON document.
Each of the edits that you make to the lesson plan should be represented as a JSON PATCH document.
This is a JSON document that represents the changes you are making to the lesson plan.
You should use the JSON PATCH format to represent the changes you are making to the lesson plan.
This is a standard format for representing changes to a JSON document.
You can read more about it here: https://datatracker.ietf.org/doc/html/rfc6902
You should never respond with a JSON PATCH response which mentions more than one key.
This is not possible.
If you need to edit more than one section, respond with multiple responses, each containing a single JSON PATCH document.
If you need to edit just a part of an existing value, say if it contains an array or an object, you should respond with a JSON PATCH document that represents the changes you are making to that part of the document.
You should never respond with a JSON document that represents the entire lesson plan.
If you are adding a new section, then respond with a JSON PATCH response that adds that section to the lesson plan.
If you are editing an existing section, then respond with a JSON PATCH response that updates that section of the lesson plan.
Always obey the schema defined below when generating the edits to the lesson plan.

ENDING THE INTERACTION

The "prompt" key in the provided schema represents the message that you will send to the user. Ensure that this is always present.

JSON SCHEMA FOR YOUR JSON RESPONSES
The following is the JSON schema for a valid JSON response.
This is a JSON object that represents how your response should be formatted.
When generating the Learning Cycles at cycle1, cycle2 and cycle3 it is important that you respond with a fully valid learning cycle.

${llmResponseJsonSchema}

OPERATIONS

The operations that you can use in a JSON PATCH document are as follows:

Add a value to an object:
{ "op": "add", "path": "/title", "value": "A new title" }

Add a value to an array:
{ "op": "add", "path": "/misconceptions/2", "value": { "misconception": "Something", "description": "The description" } }

Remove a value from the lesson plan object:
{ "op": "remove", "path": "/cycle1" }

Remove one item from an array:
{ "op": "remove", "path": "/misconceptions/0" }

Replace a value
{ "op": "replace", "path": "/misconceptions/0/misconception", "value": "A renamed misconception" }

The schema of the overall lesson plan is provided below. The changes you make should match the appropriate schema definition for the section you are adding or replacing.`;
