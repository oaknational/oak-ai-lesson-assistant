import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { create } from "zustand";

type LessonPlanStore = {
  lessonPlan: LooseLessonPlan;
  tempLessonPlan: LooseLessonPlan;
  partialPatches: any[];
  validPatches: any[];

  setLessonPlan: (plan: LooseLessonPlan) => void;
  setTempLessonPlan: (plan: LooseLessonPlan) => void;
  setPatches: (partial: any[], valid: any[]) => void;
};

export const useLessonPlanStore = create<LessonPlanStore>((set) => ({
  lessonPlan: {},
  tempLessonPlan: {},
  partialPatches: [],
  validPatches: [],

  setLessonPlan: (plan) => set({ lessonPlan: plan }),
  setTempLessonPlan: (plan) => set({ tempLessonPlan: plan }),
  setPatches: (partial, valid) =>
    set({
      partialPatches: partial,
      validPatches: valid,
    }),
}));
