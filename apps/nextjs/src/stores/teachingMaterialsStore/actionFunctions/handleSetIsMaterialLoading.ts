import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const handleSetIsMaterialLoading =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (isLoading: boolean) => {
    set({ isMaterialLoading: isLoading });
  };

export const handleSetIsMaterialRefining =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (isRefining: boolean) => {
    set({ isMaterialRefining: isRefining });
  };

export default handleSetIsMaterialLoading;
