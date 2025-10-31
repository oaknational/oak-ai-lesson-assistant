import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

export const handleSetSubject =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (subject: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        subject,
      },
    }));
  };

export const handleSetTitle =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (title: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        title,
      },
    }));
  };

export const handleSetYear =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (year: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        year,
      },
    }));
  };

export const handleSetActiveDropdown =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) =>
  (activeDropdown: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        activeDropdown,
      },
    }));
  };

export const handleResetFormState =
  (set: TeachingMaterialsSetter, get: TeachingMaterialsGetter) => () => {
    set({
      formState: {
        subject: null,
        title: null,
        year: null,
        activeDropdown: null,
      },
    });
  };
