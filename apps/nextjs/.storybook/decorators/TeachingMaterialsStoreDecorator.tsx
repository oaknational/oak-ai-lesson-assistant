import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";
import { fn } from "@storybook/test";

import useAnalytics from "@/lib/analytics/useAnalytics";
import { ResourcesStoresContext } from "@/stores/ResourcesStoreProvider";
import { createResourcesStore } from "@/stores/resourcesStore";
import type { ResourcesState } from "@/stores/resourcesStore/types";

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
        categories: ["l/strong-language", "u/sensitive-content"],
      },
    };

    // Create the store with merged initial values from parameters
    const resourcesStore = createResourcesStore(trackEvents, {
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
