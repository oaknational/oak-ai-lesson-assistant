import type { z } from "zod";

import {
  AMERICANISM_ISSUE_KIND,
  type AmericanismIssue,
} from "../../../../features/americanisms";
import { DEFAULT_AGENT_MODEL_PARAMS } from "../../constants";
import type { GenericPromptAgent, SectionKey } from "../../schema";
import { britishEnglishCorrectorAgentInstructions } from "./britishEnglishCorrectorAgent.instructions";

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
    id: `british-english-corrector--${sectionKey}`,
    responseSchema,
    input: [
      {
        role: "developer" as const,
        content: britishEnglishCorrectorAgentInstructions,
      },
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
    modelParams: DEFAULT_AGENT_MODEL_PARAMS,
  };
}
