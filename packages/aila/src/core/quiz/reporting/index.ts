export { Report, type ReportNode, type RootReportNode } from "./Report";
export { Task } from "./Task";
export {
  createQuizTracker,
  type QuizTracker,
  type QuizTrackerOptions,
} from "./QuizTracker";
export { createMockTask } from "./testing";
export { ReportStorage, type StoredQuizReport } from "./ReportStorage";

// Schemas and extractors for typed access to ReportNode data
export {
  GeneratorDataSchema,
  ElasticsearchDataSchema,
  CohereDataSchema,
  ImageDescriptionsDataSchema,
  ComposerPromptDataSchema,
  ComposerLlmDataSchema,
  type GeneratorData,
  type ElasticsearchData,
  type CohereData,
  type ImageDescriptionsData,
  type ComposerPromptData,
  type ComposerLlmData,
} from "./schemas";

export {
  getChild,
  getNodeByPath,
  extractGeneratorData,
  extractElasticsearchData,
  extractCohereData,
  extractImageDescriptionsData,
  extractComposerPromptData,
  extractComposerLlmData,
} from "./extractors";
