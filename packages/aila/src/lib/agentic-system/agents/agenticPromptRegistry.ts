import { PromptVariants } from "@oakai/core/src/models/promptVariants";
import type { OakPromptDefinition } from "@oakai/core/src/prompts/types";
import type { PrismaClientWithAccelerate } from "@oakai/db/client";

import { z } from "zod";

const VARIANT_SLUG = "main";

/** A prompt template to resolve to a persisted `prompts.id`. */
export type AgenticPromptTemplate = {
  promptTemplateId: string;
  /** The version-stable static prompt body captured at execution time. */
  promptTemplate: string;
};

function promptTemplateIdToPromptSlug(promptTemplateId: string): string {
  return `agentic-${promptTemplateId.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`;
}

function createAgenticPromptDefinition({
  promptTemplateId,
  promptTemplate,
}: AgenticPromptTemplate): OakPromptDefinition {
  return {
    appId: "lesson-planner",
    name: `Agentic Aila: ${promptTemplateId}`,
    slug: promptTemplateIdToPromptSlug(promptTemplateId),
    variants: [
      {
        slug: VARIANT_SLUG,
        parts: {
          body: promptTemplate,
          context: "",
          output: "",
          task: "",
        },
      },
    ],
    inputSchema: z.object({}),
    outputSchema: z.object({}),
  };
}

/**
 * A prompt template's body only changes when its instructions or voice change,
 * so the resolved prompt id is stable for the life of the process. We memoise
 * the in-flight promise per promptTemplateId so the lookups happen once per
 * process rather than every turn, and concurrent turns share a single
 * resolution. Failures are not cached, so a transient error retries next turn.
 */
const promptIdCache = new Map<string, Promise<string>>();

async function resolveSinglePromptId(
  prisma: PrismaClientWithAccelerate,
  template: AgenticPromptTemplate,
): Promise<string> {
  const prompts = new PromptVariants(
    prisma,
    createAgenticPromptDefinition(template),
    VARIANT_SLUG,
  );
  // Version only changes when the prompt body changes, not on every deploy.
  const prompt = await prompts.setCurrent(VARIANT_SLUG, true, {
    stableAcrossDeploys: true,
  });
  if (!prompt?.id) {
    throw new Error(
      `Failed to resolve agentic prompt id for ${template.promptTemplateId}`,
    );
  }
  return prompt.id;
}

export async function resolveAgenticPromptIds({
  prisma,
  templates,
}: {
  prisma: PrismaClientWithAccelerate;
  templates: AgenticPromptTemplate[];
}): Promise<Record<string, string>> {
  // Each promptTemplateId encodes every body-varying axis, so all templates
  // sharing an id have the same body; dedupe by id and resolve once.
  const uniqueTemplates = new Map<string, AgenticPromptTemplate>();
  for (const template of templates) {
    if (!uniqueTemplates.has(template.promptTemplateId)) {
      uniqueTemplates.set(template.promptTemplateId, template);
    }
  }

  const entries = await Promise.all(
    [...uniqueTemplates.values()].map(async (template) => {
      const { promptTemplateId } = template;
      let idPromise = promptIdCache.get(promptTemplateId);
      if (!idPromise) {
        idPromise = resolveSinglePromptId(prisma, template).catch((error) => {
          promptIdCache.delete(promptTemplateId);
          throw error;
        });
        promptIdCache.set(promptTemplateId, idPromise);
      }
      return [promptTemplateId, await idPromise] as const;
    }),
  );

  return Object.fromEntries(entries);
}

/** Test-only: clears the per-process prompt id memo. */
export function __clearAgenticPromptIdCache(): void {
  promptIdCache.clear();
}
