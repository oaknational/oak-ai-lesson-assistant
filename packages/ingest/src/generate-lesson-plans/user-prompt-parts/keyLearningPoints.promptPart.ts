import type { RawLesson } from "../../zod-schema/zodSchema";
import { toMarkdownList } from "./toMarkdownList";

export const keyLearningPointsPromptPart = ({
  keyLearningPoints,
}: RawLesson) =>
  keyLearningPoints?.length
    ? `The lesson's keyLearningPoints should match exactly this list of key learning points:

${toMarkdownList(keyLearningPoints, (k) => k.keyLearningPoint)}`
    : null;
