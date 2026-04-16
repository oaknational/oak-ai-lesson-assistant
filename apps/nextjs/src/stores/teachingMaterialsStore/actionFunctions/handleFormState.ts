import type {
  TeachingMaterialsGetter,
  TeachingMaterialsSetter,
} from "../types";

export const handleSetSubject =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) =>
  (subject: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        subject,
      },
    }));
  };

export const handleSetTitle =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) =>
  (title: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        title,
      },
    }));
  };

export const handleSetYear =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) =>
  (year: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        year,
      },
    }));
  };

export const handleSetActiveDropdown =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) =>
  (activeDropdown: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        activeDropdown,
      },
    }));
  };

export const handleResetFormState =
  (set: TeachingMaterialsSetter, _get: TeachingMaterialsGetter) => () => {
    set({
      formState: {
        subject: null,
        title: null,
        year: null,
        activeDropdown: null,
      },
    });
  };
