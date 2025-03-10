import React, { useEffect } from 'react';
import { ValidationError } from 'yup';

import { UseFormReturnType } from '../../../hooks/useForm';

type FieldProps<T> = {
  form: UseFormReturnType<T>;
  name: string;
  onChange: (name: string, v: unknown) => void;
} & React.ComponentProps<any>;

const withValidationProvider =
  (Field: any) =>
  <T,>({ form, name, onChange, ...fieldProps }: FieldProps<T>) => {
    const value = form.values[name];

    useEffect(() => {
      const findErrors = async () => {
        try {
          // Use reach to handle nested schema structures:
          await form.validationSchema.validateAt(name, form.values); // Correct validation
          form.setErrors(name, []);
        } catch (e) {
          if (e instanceof ValidationError) {
            form.setErrors(name, e.errors);
          } else {
            form.setErrors(name, [
              'An unexpected error occurred during validation.',
            ]); // Handle generic errors
          }
        }
      };

      findErrors();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values]);

    const handleChange = (...args: unknown[]) => {
      const v = onChange ? onChange(...args) : args[0];
      form.setInteracted(name);
      form.setValue(name, v);
    };
    return (
      <Field
        {...fieldProps}
        value={value}
        error={
          Boolean(form.interacted[name]) && Boolean(form.errors[name]?.length)
        }
        helperText={form.interacted[name] && form.errors[name]?.[0]}
        onChange={handleChange}
      />
    );
  };

export default withValidationProvider;
