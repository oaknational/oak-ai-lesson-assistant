import { PromptVariants } from "@oakai/core/src/models/promptVariants";
import type { OakPromptDefinition } from "@oakai/core/src/prompts/types";
import type { PrismaClientWithAccelerate } from "@oakai/db/client";

import { z } from "zod";

import {
  type AgenticPromptTemplateId,
  getAgenticPromptTemplate,
} from "./agenticPromptTemplates";
import { renderStaticPromptTemplate } from "./sectionAgents/shared/staticPromptParts";

const VARIANT_SLUG = "main";

function promptTemplateIdToPromptSlug(promptTemplateId: string): string {
  return `agentic-${promptTemplateId.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`;
}

function createAgenticPromptDefinition(
  promptTemplateId: string,
): OakPromptDefinition {
  const template = getAgenticPromptTemplate(promptTemplateId);
  if (!template) {
    throw new Error(
      `No agentic prompt template defined for ${promptTemplateId}`,
    );
  }
  return {
    appId: "lesson-planner",
    name: `Agentic Aila: ${promptTemplateId}`,
    slug: promptTemplateIdToPromptSlug(promptTemplateId),
    variants: [
      {
        slug: VARIANT_SLUG,
        parts: {
          body: renderStaticPromptTemplate(template),
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
 * Agentic prompt templates only change when their instructions or voice change,
 * so the resolved prompt id for an agent is stable for the life of the process,
 * allowing memoisation per agent so the lookups happen once per
 * process rather than every turn. Failures are not
 * cached, so a transient error retries on the next turn.
 */
const promptIdCache = new Map<string, Promise<string>>();

async function resolveSinglePromptId(
  prisma: PrismaClientWithAccelerate,
  promptTemplateId: AgenticPromptTemplateId,
): Promise<string> {
  const prompts = new PromptVariants(
    prisma,
    createAgenticPromptDefinition(promptTemplateId),
    VARIANT_SLUG,
  );
  // Version only changes when the prompt template changes, not on every deploy.
  const prompt = await prompts.setCurrent(VARIANT_SLUG, true, {
    stableAcrossDeploys: true,
  });
  if (!prompt?.id) {
    throw new Error(
      `Failed to resolve agentic prompt id for ${promptTemplateId}`,
    );
  }
  return prompt.id;
}

export async function resolveAgenticPromptIds({
  prisma,
  promptTemplateIds,
}: {
  prisma: PrismaClientWithAccelerate;
  promptTemplateIds: string[];
}): Promise<Record<string, string>> {
  const uniquePromptTemplateIds = [
    ...new Set(promptTemplateIds),
  ] as AgenticPromptTemplateId[];
  const entries = await Promise.all(
    uniquePromptTemplateIds.map(async (promptTemplateId) => {
      let idPromise = promptIdCache.get(promptTemplateId);
      if (!idPromise) {
        idPromise = resolveSinglePromptId(prisma, promptTemplateId).catch(
          (error) => {
            promptIdCache.delete(promptTemplateId);
            throw error;
          },
        );
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
