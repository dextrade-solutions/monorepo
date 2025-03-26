import React, { useEffect } from 'react';
import { ValidationError } from 'yup';

import { UseFormReturnType } from '../../../hooks/useForm';

type FieldComponent<T> = React.ComponentType<T>;

const withValidationProvider =
  <
    T extends {
      value?: any;
      error?: boolean;
      helperText?: string;
      handleChange?: (value: any) => void;
      onChange?: (value: any) => void;
    },
  >(
    Field: FieldComponent<T>,
  ) =>
  ({
    form,
    name,
    onChange,
    ...fieldProps
  }: Omit<
    React.ComponentPropsWithoutRef<typeof Field>,
    'value' | 'error' | 'helperText' | 'form' | 'name'
  > & {
    form: UseFormReturnType<any>;
    name: string;
  }) => {
    const value = form.values[name];
    const error =
      Boolean(form.interacted[name]) && Boolean(form.errors[name]?.length);
    const helperText = form.interacted[name] && form.errors[name]?.[0];

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
        error={error}
        helperText={helperText}
        handleChange={handleChange}
        onChange={handleChange}
      />
    );
  };

export default withValidationProvider;
