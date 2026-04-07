import { aiLogger } from "@oakai/logger";

import type { ModerationResult } from "./moderationSchema";

const log = aiLogger("aila:moderation");

const MOCK_TOXIC_RESULT: ModerationResult = {
  categories: ["t/encouragement-violence"],
  justification: "Mock toxic result",
};

const MOCK_HIGHLY_SENSITIVE_RESULT: ModerationResult = {
  categories: ["n/self-harm-suicide"],
  justification: "Mock highly sensitive result",
};

const MOCK_SENSITIVE_RESULT: ModerationResult = {
  categories: ["l/discriminatory-language"],
  justification: "Mock sensitive result",
};

export function getMockModerationResult(message?: string) {
  if (message?.includes("mod:tox")) {
    log.info("mod:tox detected, returning mock toxic result");
    return MOCK_TOXIC_RESULT;
  }
  if (message?.includes("mod:hs")) {
    log.info("mod:hs detected, returning mock highly sensitive result");
    return MOCK_HIGHLY_SENSITIVE_RESULT;
  }
  if (message?.includes("mod:sen")) {
    log.info("mod:sen detected, returning mock sensitive result");
    return MOCK_SENSITIVE_RESULT;
  }
  return null;
}
