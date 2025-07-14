import { aiLogger } from "@oakai/logger";

import type { ComponentTypeValueType } from "@/lib/avo/Avo";

import type { ResourcesGetter, ResourcesSetter } from "../types";

const log = aiLogger("additional-materials");

export const handleSetStepNumber =
  (set: ResourcesSetter, get: ResourcesGetter) =>
  (step: number, componentType?: ComponentTypeValueType) => {
    const { stepNumber: currentStep, formState, id } = get();

    log.info("Setting step number", { step, currentStep });

    if (
      (componentType === "continue_button" ||
        componentType === "back_a_step_button") &&
      formState.subject &&
      formState.year &&
      id
    ) {
      get().actions.analytics.trackMaterialRefined(componentType);
    }
    set({ stepNumber: step });
  };
