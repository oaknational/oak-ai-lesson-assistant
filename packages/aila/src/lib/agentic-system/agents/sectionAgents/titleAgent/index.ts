import { stringListToText } from "../../../utils/stringListToText";
import { createSectionAgent } from "../createSectionAgent";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { titleInstructions } from "./title.instructions";
import { LessonTitleSchema } from "./title.schema";
import { titlesBySubjectKeyStage } from "./titlesBySubjectKeyStage";

export const titleAgent = createSectionAgent({
  responseSchema: LessonTitleSchema,
  instructions: titleInstructions,
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
  extraInputFromCtx: (ctx) => {
    const { subject = "english", keyStage = "ks3" } = ctx.currentTurn.document;
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
