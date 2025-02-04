import type { RawLesson } from "../../zod-schema/zodSchema";
import { toMarkdownList } from "./toMarkdownList";

export const misconceptionsPromptPart = ({
  misconceptionsAndCommonMistakes,
}: RawLesson) =>
  misconceptionsAndCommonMistakes?.length
    ? `The lesson's misconceptions should match exactly this list of misconception/description pairs:

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
