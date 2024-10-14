import { RawLesson } from "../../zod-schema/zodSchema";

export const learningOutcomePromptPart = ({ pupilLessonOutcome }: RawLesson) =>
  pupilLessonOutcome
    ? `One ore more of the learning cycles could be guided by the following:

- ${pupilLessonOutcome}`
    : null;
