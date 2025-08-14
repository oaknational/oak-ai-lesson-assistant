import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";
import { fn } from "@storybook/test";

import useAnalytics from "@/lib/analytics/useAnalytics";
import { ResourcesStoresContext } from "@/stores/ResourcesStoreProvider";
import { createResourcesStore } from "@/stores/resourcesStore";
import type { ResourcesState } from "@/stores/resourcesStore/types";
import type { TrpcUtils } from "@/utils/trpc";

declare module "@storybook/csf" {
  interface Parameters {
    resourcesStoreState?: Partial<ResourcesState>;
  }
}

const trackEvents = {
  teachingMaterialsSelected: fn(),
  teachingMaterialsRefined: fn(),
  teachingMaterialDownloaded: fn(),
} as unknown as ReturnType<typeof useAnalytics>["track"];

const mockTrpc: TrpcUtils = {
  client: {
    runtime: {} as any,
    query: fn(),
    mutation: fn(),
    subscription: fn(),
    additionalMaterials: {
      generateAdditionalMaterial: {
        mutate: fn(),
      },
      createMaterialSession: {
        mutate: fn(),
      },
      updateMaterialSession: {
        mutate: fn(),
      },
      generatePartialLessonPlanObject: {
        mutate: fn(),
      },
      remainingLimit: {
        query: fn(),
      },
    },
  },
} as unknown as TrpcUtils;

export const TeachingMaterialsStoreDecorator: Decorator = (
  Story,
  { parameters },
) => {
  const stores = useMemo(() => {
    // Default values for the store
    const defaultState: Partial<ResourcesState> = {
      stepNumber: 0,
      docType: "additional-glossary",
      pageData: {
        lessonPlan: {
          lessonId: "mock-lesson-id",
          title: "Mock Lesson",
        },
      },
      threatDetection: true,
      moderation: {
        justification: "This contains content that requires guidance.",
        categories: ["l2", "u1"],
      },
    };

    // Create the store with merged initial values from parameters
    const resourcesStore = createResourcesStore(trackEvents, mockTrpc, {
      ...defaultState,
      ...parameters.resourcesStoreState,
    });

    return {
      resources: resourcesStore,
    };
  }, [parameters.resourcesStoreState]);

  return (
    <ResourcesStoresContext.Provider value={stores}>
      <Story />
    </ResourcesStoresContext.Provider>
  );
};
