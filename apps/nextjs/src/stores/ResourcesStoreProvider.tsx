import { createContext, useContext, useEffect, useRef, useState } from "react";

import { useAuth } from "@clerk/nextjs";
import { type ExtractState, type StoreApi, useStore } from "zustand";

import type { TeachingMaterialsPageProps } from "@/app/aila/teaching-materials/teachingMaterialsView";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { trpc } from "@/utils/trpc";

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
  initState?: Partial<ResourcesState>;
} & TeachingMaterialsPageProps;

export const ResourcesStoresProvider: React.FC<
  ResourcesStoresProviderProps
> = ({ children, initState, ...props }) => {
  const { track } = useAnalytics();

  const trpcUtils = trpc.useUtils();

  const { isLoaded, isSignedIn } = useAuth();

  const [stores] = useState(() => {
    const storesObj: ResourcesStores = {
      resources: createResourcesStore(props, track, trpcUtils, initState),
    };
    return storesObj;
  });

  // Store initialisation
  const haveInitialized = useRef(false);
  useEffect(() => {
    // work around react strict mode double rendering
    if (haveInitialized.current) {
      return;
    }

    if (!isLoaded || !isSignedIn) return;

    if (props.source === "owa") {
      void stores.resources.getState().actions.fetchOwaData(props);
    }

    haveInitialized.current = true;
  }, [isLoaded, isSignedIn, props, stores.resources]);

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
