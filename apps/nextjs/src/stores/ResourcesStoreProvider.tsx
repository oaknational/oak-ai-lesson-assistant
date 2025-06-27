import { createContext, useContext, useState } from "react";

import { type ExtractState, type StoreApi, useStore } from "zustand";

import type { AdditionalMaterialsPageProps } from "@/app/aila/resources/resources-contents";

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

export type ResourcesStoresProviderProps = {
  children: React.ReactNode;
} & AdditionalMaterialsPageProps;

export const ResourcesStoresProvider: React.FC<
  ResourcesStoresProviderProps
> = ({ children, ...props }) => {
  const [stores] = useState(() => {
    const storesObj: ResourcesStores = {
      resources: createResourcesStore(props),
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
