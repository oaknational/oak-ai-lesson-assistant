import { SnippetStatus, prisma } from "@oakai/db";

import { inngest } from "../../client";
import { Snippets } from "../../models";

export const generateSnippetEmbeddings = inngest.createFunction(
  { name: "Generate embeddings for a snippet", id: "app-snippet-embed" },
  { event: "app/snippet.embed" },
  async ({ event, step }) => {
    const { snippetId } = event.data;

    await step.run(
      "Get OpenAI embedding  for snippet and store in database",
      async () => {
        await new Snippets(prisma).embed(snippetId);
        return {
          snippetId,
        };
      },
    );

    await step.run("Update status to SUCCESS", async () => {
      await prisma.snippet.update({
        where: { id: snippetId },
        data: { status: SnippetStatus.SUCCESS, updatedAt: new Date() },
      });
    });
  },
);
