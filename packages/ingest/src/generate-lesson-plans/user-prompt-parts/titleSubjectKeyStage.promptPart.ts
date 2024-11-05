import type { RawLesson } from "../../zod-schema/zodSchema";

export const titleSubjectKeyStagePromptPart = ({
  lessonTitle,
  subjectSlug,
  keyStageSlug,
}: RawLesson) =>
  `I would like to generate a lesson plan with the title "${lessonTitle}", subject "${subjectSlug}" and key stage "${keyStageSlug}".`;
