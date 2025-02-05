import type { StoreApi } from "zustand";

import type { LessonPlanStore } from ".";

export type LessonPlanSetter = StoreApi<LessonPlanStore>["setState"];
export type LessonPlanGetter = StoreApi<LessonPlanStore>["getState"];
