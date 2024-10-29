import type { RawLesson } from "../../zod-schema/zodSchema";

export const yearPromptPart = ({ yearTitle }: RawLesson) =>
  yearTitle ? `The lesson is intended for ${yearTitle}.` : null;
