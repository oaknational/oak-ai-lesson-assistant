import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const handleSetIsMaterialLoading =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) =>
  (isLoading: boolean) => {
    set({ isMaterialLoading: isLoading });
  };

export const handleSetIsMaterialRefining =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) =>
  (isRefining: boolean) => {
    set({ isMaterialRefining: isRefining });
  };

export default handleSetIsMaterialLoading;
