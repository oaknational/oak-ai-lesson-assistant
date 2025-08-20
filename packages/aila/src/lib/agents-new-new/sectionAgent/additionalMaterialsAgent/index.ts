import { z } from "zod";

import { createSectionAgent } from "../createSectionAgent";
import { additionalMaterialsInstructions } from "./additionalMaterialsInstructions";

export const additionalMaterialsAgent = createSectionAgent({
  responseSchema: z.string(),
  instructions: additionalMaterialsInstructions,
});
