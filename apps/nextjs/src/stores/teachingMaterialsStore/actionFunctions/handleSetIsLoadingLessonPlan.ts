import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

export const handleSetIsLoadingLessonPlan =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (isLoading: boolean) => {
    set({ isLoadingLessonPlan: isLoading });
  };
