import { createContext, useContext, useState } from "react";

import { nanoid } from "nanoid";
import { type ExtractState, type StoreApi, useStore } from "zustand";

import { createResourcesStore } from "./resourcesStore";
import type { ResourcesState } from "./resourcesStore/types";

export type ResourcesStores = {
  resources: StoreApi<ResourcesState>;
};

export type GetResourcesStore = <T extends keyof ResourcesStores>(
  storeName: T,
) => ExtractState<ResourcesStores[T]>;

export const ResourcesStoresContext = createContext<
  ResourcesStores | undefined
>(undefined);

export interface ResourcesStoresProviderProps {
  children: React.ReactNode;
  id?: string;
}

export const ResourcesStoresProvider: React.FC<
  ResourcesStoresProviderProps
> = ({ children, id = nanoid() }) => {
  const [stores] = useState(() => {
    const storesObj: ResourcesStores = {
      resources: createResourcesStore({ id }),
    };
    return storesObj;
  });

  return (
    <ResourcesStoresContext.Provider value={stores}>
      {children}
    </ResourcesStoresContext.Provider>
  );
};

export const useResourcesStore = <T,>(
  selector: (store: ResourcesState) => T,
) => {
  const context = useContext(ResourcesStoresContext);
  if (!context) {
    throw new Error("Missing ResourcesStoresProvider");
  }
  return useStore(context.resources, selector);
};

export const useResourcesActions = () => {
  const context = useContext(ResourcesStoresContext);
  if (!context) {
    throw new Error("Missing ResourcesStoresProvider");
  }
  return useStore(context.resources, (state) => state.actions);
};
