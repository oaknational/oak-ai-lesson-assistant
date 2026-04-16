import { DEFAULT_AGENT_MODEL_PARAMS } from "../../../constants";
import { createSectionAgent } from "../createSectionAgent";
import { subjectInstructions } from "./subject.instructions";
import { SubjectSchema } from "./subject.schema";
import { subjectsByKeyStage } from "./subjectsByKeyStage";

export const subjectAgent = createSectionAgent({
  responseSchema: SubjectSchema,
  instructions: subjectInstructions,
  modelParams: DEFAULT_AGENT_MODEL_PARAMS,
  extraInputFromCtx: (ctx) => {
    return [
      {
        role: "developer" as const,
        content: [
          "OAK SUBJECTS",
          "These are the subjects that Oak Academy has lessons for under this key-stage.",
          subjectsByKeyStage[ctx.currentTurn.document.keyStage ?? "all"] ??
            subjectsByKeyStage.all,
        ].join("\n\n"),
      },
    ];
  },
});
