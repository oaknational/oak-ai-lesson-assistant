import type { ResourcesGetter, ResourcesSetter } from "../types";

const handleSetIsResourcesLoading =
  (set: ResourcesSetter, get: ResourcesGetter) => (isLoading: boolean) => {
    set({ isResourcesLoading: isLoading });
  };

export default handleSetIsResourcesLoading;
