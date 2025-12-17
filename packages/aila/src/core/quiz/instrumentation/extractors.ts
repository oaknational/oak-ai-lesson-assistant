/**
 * Typed extractors for ReportNode data.
 * These only return data for complete nodes, validated with Zod schemas.
 */
import type { ReportNode } from "./Report";
import {
  type CohereData,
  CohereDataSchema,
  type ComposerLlmData,
  ComposerLlmDataSchema,
  type ComposerPromptData,
  ComposerPromptDataSchema,
  type ElasticsearchData,
  ElasticsearchDataSchema,
  type GeneratorData,
  GeneratorDataSchema,
  type ImageDescriptionsData,
  ImageDescriptionsDataSchema,
} from "./schemas";

/**
 * Get a child node by name
 */
export function getChild(
  node: ReportNode | undefined,
  name: string,
): ReportNode | undefined {
  return node?.children[name];
}

/**
 * Get a nested child by path
 */
export function getNodeByPath(
  root: ReportNode | undefined,
  path: string[],
): ReportNode | undefined {
  let node = root;
  for (const segment of path) {
    node = node?.children[segment];
  }
  return node;
}

/**
 * Extract generator data from a complete node
 */
export function extractGeneratorData(
  node: ReportNode | undefined,
): GeneratorData | undefined {
  if (node?.status !== "complete") return undefined;
  const result = GeneratorDataSchema.safeParse(node.data);
  if (!result.success) {
    console.error("Invalid generator data:", result.error);
    return undefined;
  }
  // Cast pools to proper type (validated as array above)
  return result.data as GeneratorData;
}

/**
 * Extract Elasticsearch data from a complete node
 */
export function extractElasticsearchData(
  node: ReportNode | undefined,
): ElasticsearchData | undefined {
  if (node?.status !== "complete") return undefined;
  const result = ElasticsearchDataSchema.safeParse(node.data);
  if (!result.success) {
    console.error("Invalid elasticsearch data:", result.error);
    return undefined;
  }
  return result.data;
}

/**
 * Extract Cohere data from a complete node
 */
export function extractCohereData(
  node: ReportNode | undefined,
): CohereData | undefined {
  if (node?.status !== "complete") return undefined;
  const result = CohereDataSchema.safeParse(node.data);
  if (!result.success) {
    console.error("Invalid cohere data:", result.error);
    return undefined;
  }
  return result.data;
}

/**
 * Extract image descriptions data from a complete node
 */
export function extractImageDescriptionsData(
  node: ReportNode | undefined,
): ImageDescriptionsData | undefined {
  if (node?.status !== "complete") return undefined;
  const result = ImageDescriptionsDataSchema.safeParse(node.data);
  if (!result.success) {
    console.error("Invalid image descriptions data:", result.error);
    return undefined;
  }
  return result.data;
}

/**
 * Extract composer prompt data from a complete node
 */
export function extractComposerPromptData(
  node: ReportNode | undefined,
): ComposerPromptData | undefined {
  if (node?.status !== "complete") return undefined;
  const result = ComposerPromptDataSchema.safeParse(node.data);
  if (!result.success) {
    console.error("Invalid composer prompt data:", result.error);
    return undefined;
  }
  return result.data;
}

/**
 * Extract composer LLM data from a complete node
 */
export function extractComposerLlmData(
  node: ReportNode | undefined,
): ComposerLlmData | undefined {
  if (node?.status !== "complete") return undefined;
  const result = ComposerLlmDataSchema.safeParse(node.data);
  if (!result.success) {
    console.error("Invalid composer LLM data:", result.error);
    return undefined;
  }
  return result.data;
}
