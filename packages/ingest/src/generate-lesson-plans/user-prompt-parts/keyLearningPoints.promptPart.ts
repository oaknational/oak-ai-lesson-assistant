import type { RawLesson } from "../../zod-schema/zodSchema";
import { toMarkdownList } from "./toMarkdownList";

export const keyLearningPointsPromptPart = ({
  keyLearningPoints,
}: RawLesson) =>
  keyLearningPoints?.length
    ? `The lesson should include the following key learning points. Include these in the lesson plan:

${toMarkdownList(keyLearningPoints, (k) => k.keyLearningPoint)}`
    : null;
