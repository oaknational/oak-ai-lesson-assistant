import type { ModerationBase } from "./moderationSchema";

export type LockingSafetyResult = "highly-sensitive" | "toxic";

export type SafetyResult = "safe" | "guidance-required" | LockingSafetyResult;

export function isLockingSafetyResult(
  safety: SafetyResult,
): safety is LockingSafetyResult {
  const locking: Record<LockingSafetyResult, true> = {
    "highly-sensitive": true,
    toxic: true,
  };
  return safety in locking;
}

export function isToxic(result: ModerationBase): boolean {
  return result.categories.some((category) =>
    typeof category === "string" ? category.startsWith("t/") : false,
  );
}

export function isHighlySensitive(result: ModerationBase): boolean {
  return result.categories.some((category) =>
    typeof category === "string" ? category.startsWith("n/") : false,
  );
}

export function isGuidanceRequired(result: ModerationBase): boolean {
  return result.categories.length > 0;
}

export function isSafe(result: ModerationBase): boolean {
  return result.categories.length === 0;
}

export function getSafetyResult(result: ModerationBase): SafetyResult {
  if (isToxic(result)) {
    return "toxic";
  }

  if (isHighlySensitive(result)) {
    return "highly-sensitive";
  }

  if (isGuidanceRequired(result)) {
    return "guidance-required";
  }

  return "safe";
}
