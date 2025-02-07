import React, { useEffect } from 'react';
import { ValidationError } from 'yup';
import { UseFormReturnType } from '../../../hooks/useForm';

type FieldProps = {
  validators?: ((v: any) => false | string)[];
  validationForm: UseFormReturnType<any>;
  name: string;
  value: any;
  onChange: (name: string, v: any) => void;
} & React.ComponentProps<any>;

const withValidationProvider =
  (Field: any) =>
  ({ validationForm, name, value, onChange, ...fieldProps }: FieldProps) => {
    useEffect(() => {
      const findErrors = async (v: any) => {
        try {
          // Use reach to handle nested schema structures:
          await validationForm.resolvedSchema.validateAt(name, { [name]: v }); // Correct validation
          validationForm.setErrors(name, []);
        } catch (e) {
          if (e instanceof ValidationError) {
            validationForm.setErrors(name, e.errors);
          } else {
            validationForm.setErrors(name, [
              'An unexpected error occurred during validation.',
            ]); // Handle generic errors
          }
        }
      };

      findErrors(value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (...args: any[]) => {
      validationForm.setInteracted(name);
      onChange(name, ...args);
    };
    return (
      <Field
        {...fieldProps}
        value={value}
        error={
          Boolean(validationForm.interacted[name]) &&
          Boolean(validationForm.errors[name]?.length)
        }
        helperText={
          validationForm.interacted[name] && validationForm.errors[name]?.[0]
        }
        onChange={handleChange}
      />
    );
  };

export default withValidationProvider;
