import { prisma } from "@oakai/db";

import { inngest } from "../../inngest";
import { Snippets } from "../../models";

export const generateSnippetsForAllQuestions = inngest.createFunction(
  {
    name: "Generate snippets for all questions that do not have them",
    id: "app-snippet-generate-for-all-questions",
  },
  { event: "app/snippet.generateForAllQuestions" },
  async ({ step }) => {
    await step.run("Schedule embedding all snippets", async () => {
      const result = await new Snippets(prisma).generateForAllQuestions();
      return {
        result,
      };
    });
  },
);
