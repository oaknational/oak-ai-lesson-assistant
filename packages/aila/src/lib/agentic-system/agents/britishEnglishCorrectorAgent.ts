import type OpenAI from "openai";
import type { z } from "zod";

import { AMERICANISM_ISSUE_KIND } from "../../../features/americanisms";
import type { AmericanismIssue } from "../../../features/americanisms";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../constants";
import type { GenericPromptAgent, SectionKey } from "../schema";
import type { AgentResult } from "../types";
import { executeGenericPromptAgent } from "./executeGenericPromptAgent";

const correctorInstructions = `# Identity
You correct British English in a single section of an Oak National Academy lesson plan written for UK teachers and pupils.

# Task
You receive a single lesson-plan section as JSON, plus a list of Americanisms detected in that section with their British alternatives. Return the section corrected into British English, preserving structure and meaning.

# Constraints
- Do not change keys or structure. Return the same shape you received.
- Do not change the educational meaning of the content.
- Preserve case: "Recognize" → "Recognise", "RECOGNIZE" → "RECOGNISE".
- Apply British English consistently across the section, not only to the listed phrases — if you notice closely related Americanisms in the same section, fix those too.
- Verbs use -ise / -ised / -ising (recognise, emphasise, utilise, organise, analyse). Never -ize / -ized / -izing.
- Words ending in single vowel + L double the L before suffixes: labelled, travelling, modelling, cancelled, fuelled.
- Use -our endings (colour, behaviour, favour, neighbour, honour, labour) and -re endings (centre, metre, theatre, fibre, litre).
- Vocabulary: rubber (not eraser), pavement (not sidewalk), lift (not elevator), rubbish (not trash), biscuit (not cookie), trousers (not pants), holiday (not vacation), autumn (not "fall" except when meaning to drop), maths (not math), grey (not gray).
- Do not add commentary, markdown, or explanations.`;

const issueKindLabel = (issue: AmericanismIssue["issue"]): string => {
  switch (issue) {
    case AMERICANISM_ISSUE_KIND.SPELLING:
      return "spelling";
    case AMERICANISM_ISSUE_KIND.PHRASING:
      return "phrasing";
    case AMERICANISM_ISSUE_KIND.MEANING:
      return "meaning";
  }
};

const issueDetail = (issue: AmericanismIssue): string => {
  if (issue.issue === AMERICANISM_ISSUE_KIND.MEANING) {
    return "context-dependent — only correct if used in a US sense";
  }
  return issue.details;
};

const issuesBlock = (issues: AmericanismIssue[]): string => {
  const lines = issues.map(
    (i) => `- "${i.phrase}" → ${issueDetail(i)} (${issueKindLabel(i.issue)})`,
  );
  return `Issues detected in this section:\n${lines.join("\n")}`;
};

export type BritishEnglishCorrectorAgentProps = {
  sectionKey: SectionKey;
  content: unknown;
  issues: AmericanismIssue[];
  responseSchema: z.ZodTypeAny;
};

export function createBritishEnglishCorrectorAgent({
  sectionKey,
  content,
  issues,
  responseSchema,
}: BritishEnglishCorrectorAgentProps): GenericPromptAgent<unknown> {
  return {
    responseSchema,
    input: [
      { role: "developer" as const, content: correctorInstructions },
      {
        role: "developer" as const,
        content: `Section key: ${sectionKey}`,
      },
      { role: "developer" as const, content: issuesBlock(issues) },
      {
        role: "user" as const,
        content: `Original section JSON:\n${JSON.stringify(content)}`,
      },
    ],
    modelParams: {
      ...DEFAULT_AGENT_MODEL_PARAMS,
    },
  };
}

export const createOpenAIBritishEnglishCorrectorAgent =
  (openai: OpenAI) =>
  (props: BritishEnglishCorrectorAgentProps): Promise<AgentResult<unknown>> =>
    executeGenericPromptAgent({
      agent: createBritishEnglishCorrectorAgent(props),
      openai,
    });
