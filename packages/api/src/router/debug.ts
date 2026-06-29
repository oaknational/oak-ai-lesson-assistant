import {
  DEFAULT_CATEGORISE_MODEL,
  DEFAULT_MODEL,
  DEFAULT_MODERATION_MODEL,
} from "@oakai/aila/src/constants";
import { DEFAULT_RESPONSES_MODEL } from "@oakai/aila/src/lib/agentic-system/constants";

import { TRPCError } from "@trpc/server";

import { adminProcedure } from "../middleware/adminAuth";
import { router } from "../trpc";
import { getAgenticAilaEnabled } from "../utils/getAgenticAilaEnabled";

export const debugRouter = router({
  getAilaOverlayState: adminProcedure.query(async () => {
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === "prd") {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return {
      agenticEnabled: await getAgenticAilaEnabled(),
      models: {
        chat: DEFAULT_MODEL,
        moderation: DEFAULT_MODERATION_MODEL,
        categorise: DEFAULT_CATEGORISE_MODEL,
        agentic: DEFAULT_RESPONSES_MODEL,
      },
    };
  }),
});
