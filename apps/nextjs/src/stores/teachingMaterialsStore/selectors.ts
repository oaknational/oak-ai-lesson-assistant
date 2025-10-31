import type { TeachingMaterialsState } from "./types";

/**
 * Selector for the step number in the resources workflow
 * @example const stepNumber = useTeachingMaterialsStore(stepNumberSelector);
 */
export const stepNumberSelector = (state: TeachingMaterialsState) => state.stepNumber;

/**
 * Selector for the page data in the resources workflow
 * @example const pageData = useTeachingMaterialsStore(pageDataSelector);
 */
export const pageDataSelector = (state: TeachingMaterialsState) => state.pageData;

/**
 * Selector for the generated material in the resources workflow
 * @example const generation = useTeachingMaterialsStore(generationSelector);
 */
export const generationSelector = (state: TeachingMaterialsState) => state.generation;

/**
 * Selector for the document type in the resources workflow
 * @example const docType = useTeachingMaterialsStore(docTypeSelector);
 */
export const docTypeSelector = (state: TeachingMaterialsState) => state.docType;

/**
 * Selector for the is resources loading in the resources workflow
 * @example const isResourcesLoading = useTeachingMaterialsStore(isResourcesLoadingSelector);
 */
export const isResourcesLoadingSelector = (state: TeachingMaterialsState) =>
  state.isResourcesLoading;

/**
 * Selector for the source in the resources workflow
 * @example const source = useTeachingMaterialsStore(sourceSelector);
 */
export const sourceSelector = (state: TeachingMaterialsState) => state.source;

/**
 * Selector for the is resources loading in the resources workflow
 * @example const isResourcesDownloading = useTeachingMaterialsStore(isResourcesLoadingSelector);
 */
export const isResourcesDownloadingSelector = (state: TeachingMaterialsState) =>
  state.isDownloading;

/**
 * Selector for the is resource refining in the resources workflow
 * @example const isResourceRefining = useTeachingMaterialsStore(isResourceRefiningSelector);
 */
export const isResourceRefiningSelector = (state: TeachingMaterialsState) =>
  state.isResourceRefining;

// Form state selectors
export const formStateSelector = (state: TeachingMaterialsState) => state.formState;
export const subjectSelector = (state: TeachingMaterialsState) =>
  state.formState.subject;
export const titleSelector = (state: TeachingMaterialsState) => state.formState.title;
export const yearSelector = (state: TeachingMaterialsState) => state.formState.year;
export const activeDropdownSelector = (state: TeachingMaterialsState) =>
  state.formState.activeDropdown;

// Is loading lesson plan selector
export const isLoadingLessonPlanSelector = (state: TeachingMaterialsState) =>
  state.isLoadingLessonPlan;

export const moderationSelector = (state: TeachingMaterialsState) => state.moderation;

/**
 * Selector for the id in the resources workflow
 * @example const id = useTeachingMaterialsStore(idSelector);
 */
export const idSelector = (state: TeachingMaterialsState) => state.id;

/**
 * Selector for the threat detection state in the resources workflow
 * @example const threatDetection = useTeachingMaterialsStore(threatDetectionSelector);
 */
export const threatDetectionSelector = (state: TeachingMaterialsState) =>
  state.threatDetection;

/**
 * Selector for the error state in the resources workflow
 * @example const error = useTeachingMaterialsStore(errorSelector);
 */
export const errorSelector = (state: TeachingMaterialsState) => state.error;

/**
 * Selector for the refinement generation history in the resources workflow
 * @example const refinementHistory = useTeachingMaterialsStore(refinementGenerationHistorySelector);
 */
export const refinementGenerationHistorySelector = (state: TeachingMaterialsState) =>
  state.refinementGenerationHistory;
