import { flatten } from 'lodash';
import { useState } from 'react';

export const useForm = ({
  validationSchema,
}: { validationSchema?: any } = {}) => {
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

  return {
    validationSchema,
    errors: errorsData,
    interacted: interactedData,
    isInitiated,
    isInteracted,
    primaryError,
    setInteracted,
    setErrors,
  };
};
