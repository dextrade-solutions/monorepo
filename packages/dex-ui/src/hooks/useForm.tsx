import { flatten } from 'lodash';
import { useEffect, useState } from 'react';
import { SchemaOf } from 'yup';

import { useLoader } from './useLoader';
import { useGlobalModalContext } from '../components/app/modals';

export type UseFormReturnType<T> = {
  validationSchema: SchemaOf<T> | undefined;
  errors: { [key: string]: string[] };
  interacted: { [key: string]: boolean };
  isInitiated: boolean;
  isInteracted: boolean;
  primaryError: string | undefined;
  values: T;
  setInteracted: (name: string) => void;
  setErrors: (name: string, errors: string[]) => void;
  setValues: React.Dispatch<React.SetStateAction<any>>; // And this to update values
  submit: (...args: any[]) => Promise<void>;
  reset: () => void;
};

export const useForm = <T,>({
  validationSchema,
  values,
  method,
}: {
  validationSchema?: SchemaOf<T>;
  values?: T;
  method: (values: T, ...args: any[]) => Promise<void | any>;
}): UseFormReturnType<T> => {
  const { runLoader } = useLoader();
  const { showModal } = useGlobalModalContext();
  const [valuesData, setValuesData] = useState<T>(values || ({} as T));
  const [errorsData, setErrorsData] = useState({});
  const [interactedData, setInteractedData] = useState({});

  const isInitiated = Object.values(errorsData).length > 0;
  const isInteracted = Object.values(interactedData).length > 0;
  const [primaryError] = flatten(Object.values(errorsData));

  const setInteracted = (name: string) => {
    setInteractedData((prev) => ({ ...prev, [name]: true }));
  };

  const setErrors = (name: string, errors: string[]) => {
    setErrorsData((prev) => ({ ...prev, [name]: errors }));
  };

  const setValue = (name: string, value: any) => {
    setValuesData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    validationSchema,
    errors: errorsData,
    interacted: interactedData,
    isInitiated,
    isInteracted,
    primaryError,
    values: valuesData,
    setInteracted,
    setErrors,
    setValue,
    reset: () => {
      setValuesData(values || ({} as T));
      setErrorsData({});
      setInteractedData({});
    },
    submit: async (...args) => {
      if (args[0] && args[0].preventDefault) {  // Check if the first argument is an event
        args[0].preventDefault();
      }
      try {
        await runLoader(method(valuesData, ...args));
      } catch (e) {
        showModal({
          name: 'ALERT_MODAL',
          severity: 'error',
          text: e.message,
        });
        throw new Error(e);
      }
    },
  };
};
