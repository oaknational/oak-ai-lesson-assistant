import { createContext, useContext, useEffect, useRef, useState } from "react";

import { useAuth, useUser } from "@clerk/nextjs";
import { type ExtractState, type StoreApi, useStore } from "zustand";

import type { TeachingMaterialsPageProps } from "@/app/aila/teaching-materials/teachingMaterialsView";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { trpc } from "@/utils/trpc";

import { createTeachingMaterialsStore } from "./teachingMaterialsStore";
import type { TeachingMaterialsState } from "./teachingMaterialsStore/types";

export type TeachingMaterialsStores = {
  teachingMaterials: StoreApi<TeachingMaterialsState>;
};

export type GetTeachingMaterialsStore = <T extends keyof TeachingMaterialsStores>(
  storeName: T,
) => ExtractState<TeachingMaterialsStores[T]>;

export const TeachingMaterialsStoresContext = createContext<
  TeachingMaterialsStores | undefined
>(undefined);

export type TeachingMaterialsStoresProviderProps = {
  children: React.ReactNode;
  initState?: Partial<TeachingMaterialsState>;
} & TeachingMaterialsPageProps;

export const TeachingMaterialsStoresProvider: React.FC<
  TeachingMaterialsStoresProviderProps
> = ({ children, initState, ...props }) => {
  const { track } = useAnalytics();

  const trpcUtils = trpc.useUtils();

  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [stores] = useState(() => {
    const refreshAuth = user?.reload
      ? async () => {
          await user.reload();
        }
      : undefined;

    const storesObj: TeachingMaterialsStores = {
      teachingMaterials: createTeachingMaterialsStore(
        props,
        track,
        trpcUtils,
        initState,
        refreshAuth,
      ),
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
      void stores.teachingMaterials.getState().actions.fetchOwaData(props);
    }

    haveInitialized.current = true;
  }, [isLoaded, isSignedIn, props, stores.teachingMaterials]);

  return (
    <TeachingMaterialsStoresContext.Provider value={stores}>
      {children}
    </TeachingMaterialsStoresContext.Provider>
  );
};

export const useTeachingMaterialsStore = <T,>(
  selector: (store: TeachingMaterialsState) => T,
) => {
  const context = useContext(TeachingMaterialsStoresContext);
  if (!context) {
    throw new Error("Missing TeachingMaterialsStoresProvider");
  }
  return useStore(context.teachingMaterials, selector);
};

export const useTeachingMaterialsActions = () => {
  const context = useContext(TeachingMaterialsStoresContext);
  if (!context) {
    throw new Error("Missing TeachingMaterialsStoresProvider");
  }
  return useStore(context.teachingMaterials, (state) => state.actions);
};
