import type { RawLesson } from "../../zod-schema/zodSchema";

export const yearPromptPart = ({ yearTitle }: RawLesson) =>
  yearTitle
    ? `The lesson is intended for the following UK school year: ${yearTitle}.`
    : null;
