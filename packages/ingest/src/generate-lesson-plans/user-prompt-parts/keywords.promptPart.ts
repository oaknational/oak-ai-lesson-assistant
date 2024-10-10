import { RawLesson } from "../../zod-schema/zodSchema";
import { toMarkdownList } from "./toMarkdownList";

export const lessonKeywordsPromptPart = ({ lessonKeywords }: RawLesson) =>
  lessonKeywords?.length
    ? `The lesson should include the following keywords. Include these in the lesson plan:

${toMarkdownList(lessonKeywords, getKeywordText)}`
    : null;

function getKeywordText({
  keyword,
  description,
}: {
  keyword: string;
  description: string;
}) {
  return `**${keyword}**: ${description}`;
}
