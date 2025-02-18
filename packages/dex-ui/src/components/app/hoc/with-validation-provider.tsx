import React, { useEffect } from 'react';
import { ValidationError } from 'yup';

import { UseFormReturnType } from '../../../hooks/useForm';

type FieldProps = {
  validators?: ((v: any) => false | string)[];
  form: UseFormReturnType<any>;
  name: string;
  onChange: (name: string, v: any) => void;
} & React.ComponentProps<any>;

const withValidationProvider =
  (Field: any) =>
  ({ form, name, onChange, ...fieldProps }: FieldProps) => {
    const value = form.values[name];

    useEffect(() => {
      const findErrors = async (v: any) => {
        try {
          // Use reach to handle nested schema structures:
          await form.resolvedSchema.validateAt(name, { [name]: v }); // Correct validation
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

      findErrors(value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (...args: any[]) => {
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
