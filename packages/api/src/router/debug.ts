import { DEFAULT_RESPONSES_MODEL } from "@oakai/aila/src/lib/agentic-system/constants";

import { TRPCError } from "@trpc/server";

import { adminProcedure } from "../middleware/adminAuth";
import { router } from "../trpc";

export const debugRouter = router({
  getAilaOverlayState: adminProcedure.query(() => {
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === "prd") {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return {
      model: DEFAULT_RESPONSES_MODEL,
    };
  }),
});
