/**
 * Lakera Guard API client and types
 *
 * This module provides a client for interacting with the Lakera Guard API,
 * which detects threats in text including prompt injection, jailbreaks, PII,
 * and other security issues.
 *
 * @module @oakai/core/src/threatDetection/lakera
 */

export { LakeraClient, type LakeraClientConfig } from "./LakeraClient";
export {
  lakeraGuardRequestSchema,
  lakeraGuardResponseSchema,
  type LakeraGuardRequest,
  type LakeraGuardResponse,
  type Message,
  type PayloadItem,
  type BreakdownItem,
  type DevInfo,
} from "./schema";
