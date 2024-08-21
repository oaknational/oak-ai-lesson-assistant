import z from "zod";

export const embedSnippetSchema = {
  data: z.object({
    snippetId: z.string(),
  }),
};
