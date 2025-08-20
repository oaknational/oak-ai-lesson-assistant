import { isTruthy } from "remeda";

import { BasedOnSchema } from "../../../../protocol/schema";
import { createSectionAgent } from "../createSectionAgent";
import { basedOnInstructions } from "./basedOn.instructions";

export const basedOnAgent = createSectionAgent({
  responseSchema: BasedOnSchema.nullable(),
  instructions: basedOnInstructions,
  extraInputFromState: (state) => {
    return [
      state.relevantLessons && {
        role: "developer" as const,
        content: [
          "RELEVANT LESSONS",
          "The following lessons were shown to the user:",
          JSON.stringify(
            state.relevantLessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
            })),
          ),
        ].join("\n\n"),
      },
    ].filter(isTruthy);
  },
});
