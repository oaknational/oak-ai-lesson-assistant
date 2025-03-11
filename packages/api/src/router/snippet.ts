import { Snippets } from "@oakai/core";

import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

export type DisplayFormat = "plain" | "markdown";
const displayFormats = ["plain", "markdown"] as const;
const DisplayFormatSchema = z.enum(displayFormats);

export const snippetRouter = router({
  prompt: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        snippetIds: z.array(z.string()),
        displayFormat: DisplayFormatSchema,
      }),
    )
    .query(({ ctx, input }) => {
      const { prompt, snippetIds, displayFormat } = input;
      return new Snippets(ctx.prisma).prompt({
        prompt,
        snippetIds,
        displayFormat,
      });
    }),
});
