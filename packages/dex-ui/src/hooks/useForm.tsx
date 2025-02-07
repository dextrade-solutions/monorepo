import { flatten } from 'lodash';
import { useEffect, useState } from 'react';
import { SchemaOf } from 'yup';

export type UseFormReturnType<T> = {
  validationSchema: SchemaOf<T> | undefined;
  errors: { [key: string]: string[] };
  interacted: { [key: string]: boolean };
  isInitiated: boolean;
  isInteracted: boolean;
  primaryError: string | undefined;
  setInteracted: (name: string) => void;
  setErrors: (name: string, errors: string[]) => void;
  setValues: React.Dispatch<React.SetStateAction<any>>; // And this to update values
};

export const useForm = <T,>({
  validationSchema,
  values,
}: {
  validationSchema: SchemaOf<T>;
  values: any;
} = {}): UseFormReturnType<T> => {
  const [errorsData, setErrorsData] = useState({});
  const [interactedData, setInteractedData] = useState({});
  const [resolvedSchema, setResolvedSchema] = useState<SchemaOf<T> | undefined>(
    validationSchema,
  );

  const isInitiated = Object.values(errorsData).length > 0;
  const isInteracted = Object.values(interactedData).length > 0;
  const [primaryError] = flatten(Object.values(errorsData));

  const setInteracted = (name: string) => {
    setInteractedData((prev) => ({ ...prev, [name]: true }));
  };

  const setErrors = (name: string, errors: string[]) => {
    setErrorsData((prev) => ({ ...prev, [name]: errors }));
  };

  useEffect(() => {
    if (validationSchema && values) {
      setResolvedSchema(
        validationSchema.resolve({ value: values, context: values }),
      );
    }
  }, [validationSchema, values]);

  return {
    validationSchema,
    resolvedSchema, // Include resolvedSchema in the return
    errors: errorsData,
    interacted: interactedData,
    isInitiated,
    isInteracted,
    primaryError,
    setInteracted,
    setErrors,
    values, // Make sure these are returned
  };
};
