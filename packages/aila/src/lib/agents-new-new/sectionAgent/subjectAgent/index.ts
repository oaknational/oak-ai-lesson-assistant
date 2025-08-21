import { createSectionAgent } from "../createSectionAgent";
import { subjectInstructions } from "./subjectInstructions";
import { SubjectSchema } from "./subjectSchema";
import { subjectsByKeyStage } from "./subjectsByKeyStage";

export const subjectAgent = createSectionAgent({
  responseSchema: SubjectSchema,
  instructions: subjectInstructions,
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
