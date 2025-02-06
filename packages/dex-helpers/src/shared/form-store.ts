import { create } from 'zustand';

type FormState = {
  errors: { [k: string]: string[] };
  interacted: { [k: string]: boolean };
  validationSchema: any | null;
  setInteracted: (name: string) => void;
  isInteracted: () => boolean;
  primaryError: () => string;
  isInitiated: () => boolean;
  clearForm: () => void;
  init: (validationSchema: any) => void;
  setErrors: (name: string, errors: string[]) => void;
};

export const useFormStore = create<FormState>((set, get) => ({
  errors: {},
  interacted: {},
  validationSchema: null,
  init: (validationSchema) =>
    set(() => ({
      validationSchema,
    })),
  setErrors: (name, errors) =>
    set((state) => ({ errors: { ...state.errors, [name]: errors } })),
  setInteracted: (name) =>
    set((state) => ({ interacted: { ...state.interacted, [name]: true } })),
  isInitiated: () => Object.values(get().errors).length > 0,
  isInteracted: () => Object.values(get().interacted).length > 0,
  primaryError: () => (Object.values(get().errors)[0] || []).find((v) => v[0]),
  clearForm: () => set({ errors: {}, interacted: {}, validationSchema: null }),
}));
