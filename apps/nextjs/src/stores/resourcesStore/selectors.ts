import type { ErrorType, ResourcesState } from "./types";

/**
 * Selector for the step number in the resources workflow
 * @example const stepNumber = useResourcesStore(stepNumberSelector);
 */
export const stepNumberSelector = (state: ResourcesState) => state.stepNumber;

/**
 * Selector for the page data in the resources workflow
 * @example const pageData = useResourcesStore(pageDataSelector);
 */
export const pageDataSelector = (state: ResourcesState) => state.pageData;

/**
 * Selector for the generated material in the resources workflow
 * @example const generation = useResourcesStore(generationSelector);
 */
export const generationSelector = (state: ResourcesState) => state.generation;

/**
 * Selector for the document type in the resources workflow
 * @example const docType = useResourcesStore(docTypeSelector);
 */
export const docTypeSelector = (state: ResourcesState) => state.docType;

/**
 * Selector for the is resources loading in the resources workflow
 * @example const isResourcesLoading = useResourcesStore(isResourcesLoadingSelector);
 */
export const isResourcesLoadingSelector = (state: ResourcesState) =>
  state.isResourcesLoading;

/**
 * Selector for the is resources loading in the resources workflow
 * @example const isResourcesDownloading = useResourcesStore(isResourcesLoadingSelector);
 */
export const isResourcesDownloadingSelector = (state: ResourcesState) =>
  state.isDownloading;

/**
 * Selector for the is resource refining in the resources workflow
 * @example const isResourceRefining = useResourcesStore(isResourceRefiningSelector);
 */
export const isResourceRefiningSelector = (state: ResourcesState) =>
  state.isResourceRefining;

// Form state selectors
export const formStateSelector = (state: ResourcesState) => state.formState;
export const subjectSelector = (state: ResourcesState) =>
  state.formState.subject;
export const titleSelector = (state: ResourcesState) => state.formState.title;
export const yearSelector = (state: ResourcesState) => state.formState.year;
export const activeDropdownSelector = (state: ResourcesState) =>
  state.formState.activeDropdown;

// Is loading lesson plan selector
export const isLoadingLessonPlanSelector = (state: ResourcesState) =>
  state.isLoadingLessonPlan;

export const moderationSelector = (state: ResourcesState) => state.moderation;

/**
 * Selector for the threat detection state in the resources workflow
 * @example const threatDetection = useResourcesStore(threatDetectionSelector);
 */
export const threatDetectionSelector = (state: ResourcesState) =>
  state.threatDetection;

/**
 * Selector for the error state in the resources workflow
 * @example const error = useResourcesStore(errorSelector);
 */
export const errorSelector = (state: ResourcesState) => state.error;
