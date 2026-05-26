import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

export const handleSetIsLoadingLessonPlan =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) =>
  (isLoading: boolean) => {
    set({ isLoadingLessonPlan: isLoading });
  };
