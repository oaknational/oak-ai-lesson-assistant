import { aiLogger } from "@oakai/logger";

import type { PlanStep } from "../schema";
import type { TextStreamer } from "./helpers/createTextStreamer";

const log = aiLogger("aila:agents");

export const createOnTurnComplete =
  (textStreamer: TextStreamer) =>
  async (props: {
    stepsExecuted: PlanStep[];
    ailaMessage: string;
  }): Promise<void> => {
    const { stepsExecuted, ailaMessage } = props;

    const sectionsEdited = stepsExecuted.map((step) => step.sectionKey);

    const prompt = {
      type: "text",
      value:
        ailaMessage ??
        "Here's the updated lesson plan. Do you want to make any more changes?",
    };

    const closingPart = `],"sectionsEdited":${JSON.stringify(sectionsEdited)},"prompt":${JSON.stringify(prompt)},"status":"complete"}`;

    log.info("onTurnComplete:", closingPart);
    textStreamer(closingPart);
  };
