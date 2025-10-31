import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const handleSetIsResourcesLoading =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (isLoading: boolean) => {
    set({ isResourcesLoading: isLoading });
  };

export const handleSetIsResourceRefining =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (isRefining: boolean) => {
    set({ isResourceRefining: isRefining });
  };

export default handleSetIsResourcesLoading;
