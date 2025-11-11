import { aiLogger } from "@oakai/logger";

import type { ComponentTypeValueType } from "@/lib/avo/Avo";

import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

const log = aiLogger("teaching-materials");

export const handleSetStepNumber =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (step: number, componentType?: ComponentTypeValueType) => {
    const { stepNumber: currentStep, formState, id } = get();

    log.info("Setting step number", { step, currentStep });

    window.scrollTo({ top: 0, behavior: "smooth" });

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
