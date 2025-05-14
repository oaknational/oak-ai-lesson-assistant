import type { ResourcesGetter, ResourcesSetter } from "../types";

export const handleSetIsLoadingLessonPlan =
  (set: ResourcesSetter, get: ResourcesGetter) => (isLoading: boolean) => {
    set({ isLoadingLessonPlan: isLoading });
  };
