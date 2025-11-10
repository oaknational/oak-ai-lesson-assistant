import { stringListToText } from "../../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { titleInstructions } from "./title.instructions";
import { LessonTitleSchema } from "./title.schema";
import { titlesBySubjectKeyStage } from "./titlesBySubjectKeyStage";

export const titleAgent = createSectionAgent({
  responseSchema: LessonTitleSchema,
  instructions: titleInstructions,
  extraInputFromCtx: (ctx) => {
    const { subject, keyStage } = ctx.currentTurn.document;
    if (!subject || !keyStage) {
      return [];
    }
    const titles = titlesBySubjectKeyStage[subject]?.[keyStage] ?? [];
    return [
      {
        role: "developer" as const,
        content: [
          "EXAMPLE TITLES",
          "These are example titles to give you an idea of what the user might want.",
          stringListToText<string>()(titles),
        ].join("\n\n"),
      },
    ];
  },
});
