import { aiLogger } from "@oakai/logger";

import type { SectionKey } from "../schema";

const log = aiLogger("aila:agents");

type ForcedFailure =
  | { stage: "planner" }
  | { stage: "planner_throw" }
  | { stage: "message_to_user" }
  | { stage: "message_to_user_throw" }
  | { stage: "section"; sectionKey?: SectionKey }
  | { stage: "section_throw"; sectionKey?: SectionKey };

function isFaultInjectionEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ENVIRONMENT !== "prd"
  );
}

function parseForcedFailure(rawValue: string): ForcedFailure | null {
  if (rawValue === "planner") {
    return { stage: "planner" };
  }

  if (rawValue === "planner_throw") {
    return { stage: "planner_throw" };
  }

  if (rawValue === "message_to_user") {
    return { stage: "message_to_user" };
  }

  if (rawValue === "message_to_user_throw") {
    return { stage: "message_to_user_throw" };
  }

  if (rawValue === "section") {
    return { stage: "section" };
  }

  if (rawValue === "section_throw") {
    return { stage: "section_throw" };
  }

  if (rawValue.startsWith("section:")) {
    return {
      stage: "section",
      sectionKey: rawValue.slice("section:".length) as SectionKey,
    };
  }

  if (rawValue.startsWith("section_throw:")) {
    return {
      stage: "section_throw",
      sectionKey: rawValue.slice("section_throw:".length) as SectionKey,
    };
  }

  return null;
}

function getForcedFailure(): ForcedFailure | null {
  if (!isFaultInjectionEnabled()) {
    return null;
  }

  const rawValue = process.env.AILA_AGENTIC_FORCE_FAIL;
  if (!rawValue) {
    return null;
  }

  const forcedFailure = parseForcedFailure(rawValue);
  if (!forcedFailure) {
    log.warn("Ignoring invalid AILA_AGENTIC_FORCE_FAIL value", {
      value: rawValue,
    });
    return null;
  }

  return forcedFailure;
}

export function shouldForcePlannerFailure() {
  return getForcedFailure()?.stage === "planner";
}

export function shouldForcePlannerThrow() {
  return getForcedFailure()?.stage === "planner_throw";
}

export function shouldForceSectionFailure(sectionKey: SectionKey) {
  const forcedFailure = getForcedFailure();

  return (
    forcedFailure?.stage === "section" &&
    (!forcedFailure.sectionKey || forcedFailure.sectionKey === sectionKey)
  );
}

export function shouldForceSectionThrow(sectionKey: SectionKey) {
  const forcedFailure = getForcedFailure();

  return (
    forcedFailure?.stage === "section_throw" &&
    (!forcedFailure.sectionKey || forcedFailure.sectionKey === sectionKey)
  );
}

export function shouldForceMessageToUserFailure() {
  return getForcedFailure()?.stage === "message_to_user";
}

export function shouldForceMessageToUserThrow() {
  return getForcedFailure()?.stage === "message_to_user_throw";
}
