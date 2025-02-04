import type { RawLesson } from "../../zod-schema/zodSchema";

export const learningOutcomePromptPart = ({ pupilLessonOutcome }: RawLesson) =>
  pupilLessonOutcome
    ? `The lesson's learningOutcome should match the following text exactly:

- ${pupilLessonOutcome}`
    : null;
