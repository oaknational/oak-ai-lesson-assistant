import { prisma } from "@oakai/db";

import { inngest } from "../../client";
import { Snippets } from "../../models";

export const embedAllSnippets = inngest.createFunction(
  {
    name: "Generate embeddings for all snippets that do not have them",
    id: "app-snippet-embed-all",
  },
  { event: "app/snippet.embedAll" },
  async ({ step }) => {
    await step.run("Schedule embedding all snippets", async () => {
      const result = await new Snippets(prisma).embedAll();
      return {
        result,
      };
    });
  },
);
