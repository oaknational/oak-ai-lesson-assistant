/**
 * Public exports for lesson adapters.
 */

// Slides - extraction functions and LLM-friendly content types
export {
  // Extraction functions
  classifyNonTextElement,
  extractPresentationContent,
  extractSlideContent,
  extractSlideTitle,
  extractTableCells,
  extractTextFromTextElements,
  // Utilities
  generateCellId,
  parseCellId,
  // Schemas
  nonTextElementTypeSchema,
  parsedCellIdSchema,
  slideDeckContentSchema,
  slideContentSchema,
  slideNonTextElementSchema,
  slideTableCellSchema,
  slideTableSchema,
  slideTextElementSchema,
  // Types
  type NonTextElementType,
  type ParsedCellId,
  type SlideDeckContent,
  type SlideContent,
  type SlideNonTextElement,
  type SlideTable,
  type SlideTableCell,
  type SlideTextElement,
} from "./slides";

// Agents
export { classifyLessonAdaptIntent } from "./agents";
export {
  coordinateAdaptation,
  type CoordinateAdaptationResult,
} from "./agents";
export {
  analyseKlpLearningCycles,
  type AnalyseKlpLcInput,
  type KlpLcAgentResponse,
  type SlideKlpLcMapping,
} from "./agents";

// Services
export { generatePlan } from "./services";

// Schemas
export {
  adaptationPlanSchema,
  type AdaptationPlan,
  type SlidesAgentResponse,
  type TextEdit,
  type TableCellEdit,
  generatePlanInputSchema,
  type GeneratePlanInput,
} from "./schemas";

// Execution
export {
  executeSlideChanges,
  type ExecuteSlideChangesResult,
} from "./execution";
