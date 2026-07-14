import {
  PromptVariants,
  promptHash,
} from "@oakai/core/src/models/promptVariants";
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

// Memoised per template body (keyed by its hash) so unchanged templates resolve
// once per process, not every turn. Failures aren't cached, so they retry.
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
  const uniqueTemplates = new Map<string, AgenticPromptTemplate>();
  for (const template of templates) {
    const existing = uniqueTemplates.get(template.promptTemplateId);
    if (!existing) {
      uniqueTemplates.set(template.promptTemplateId, template);
      continue;
    }

    if (existing.promptTemplate !== template.promptTemplate) {
      throw new Error(
        `Conflicting agentic prompt templates for ${template.promptTemplateId}`,
      );
    }
  }

  const entries = await Promise.all(
    [...uniqueTemplates.values()].map(async (template) => {
      const { promptTemplateId } = template;
      const cacheKey = promptHash({
        slug: promptTemplateId,
        variant: VARIANT_SLUG,
        template: template.promptTemplate,
        stableAcrossDeploys: true,
      });
      let idPromise = promptIdCache.get(cacheKey);
      if (!idPromise) {
        idPromise = resolveSinglePromptId(prisma, template).catch((error) => {
          promptIdCache.delete(cacheKey);
          throw error;
        });
        promptIdCache.set(cacheKey, idPromise);
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
