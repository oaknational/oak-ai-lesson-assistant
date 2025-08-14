import type { ResourcesGetter, ResourcesSetter } from "../types";

export const handleSetSubject =
  (set: ResourcesSetter, get: ResourcesGetter) => (subject: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        subject,
      },
    }));
  };

export const handleSetTitle =
  (set: ResourcesSetter, get: ResourcesGetter) => (title: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        title,
      },
    }));
  };

export const handleSetYear =
  (set: ResourcesSetter, get: ResourcesGetter) => (year: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        year,
      },
    }));
  };

export const handleSetActiveDropdown =
  (set: ResourcesSetter, get: ResourcesGetter) =>
  (activeDropdown: string | null) => {
    set((state) => ({
      formState: {
        ...state.formState,
        activeDropdown,
      },
    }));
  };

export const handleResetFormState =
  (set: ResourcesSetter, get: ResourcesGetter) => () => {
    set({
      formState: {
        subject: null,
        title: null,
        year: null,
        activeDropdown: null,
      },
    });
  };
