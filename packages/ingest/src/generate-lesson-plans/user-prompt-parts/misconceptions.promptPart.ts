import { RawLesson } from "../../zod-schema/zodSchema";
import { toMarkdownList } from "./toMarkdownList";

export const misconceptionsPromptPart = ({
  misconceptionsAndCommonMistakes,
}: RawLesson) =>
  misconceptionsAndCommonMistakes?.length
    ? `The lesson should include the following misconceptions. Include these in the lesson plan:

${toMarkdownList(misconceptionsAndCommonMistakes, misconceptionText)}`
    : null;

function misconceptionText({
  misconception,
  response,
}: {
  misconception: string;
  response: string;
}) {
  return `**Misconception**: ${misconception}, **Description**: ${response}`;
}
