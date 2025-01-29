import type { RawLesson } from "../../zod-schema/zodSchema";
import { toMarkdownList } from "./toMarkdownList";

export const lessonKeywordsPromptPart = ({ lessonKeywords }: RawLesson) =>
  lessonKeywords?.length
    ? `The lesson's keywords should match exactly this list of keyword/definition pairs:

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
