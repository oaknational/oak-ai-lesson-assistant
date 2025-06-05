import type { ResourcesGetter, ResourcesSetter } from "../types";

const handleSetIsResourcesLoading =
  (set: ResourcesSetter, get: ResourcesGetter) => (isLoading: boolean) => {
    set({ isResourcesLoading: isLoading });
  };

export const handleSetIsResourceRefining =
  (set: ResourcesSetter, get: ResourcesGetter) => (isRefining: boolean) => {
    set({ isResourceRefining: isRefining });
  };

export default handleSetIsResourcesLoading;
