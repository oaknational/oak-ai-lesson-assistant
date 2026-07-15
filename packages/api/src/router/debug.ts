import { DEFAULT_MODEL } from "@oakai/aila/src/constants";

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
      model: DEFAULT_MODEL,
    };
  }),
});
