import { useFormStore } from 'dex-helpers/shared';
import React, { RefObject, useEffect, useState } from 'react';

const withValidationProvider =
  (Field: any) =>
  ({
    validationForm,
    name,
    value,
    onChange,
    ...fieldProps
  }: {
    validators: ((v: any) => false | string)[];
    validationForm: RefObject<{ [k: string]: string[] }>;
    name: string;
    value: any;
    onChange: (name: string, v: any) => void;
  }) => {
    useEffect(() => {
      const findErrors = async (v: any) => {
        return validationForm.validationSchema.fields[name].validate(v);
      };
      findErrors(value)
        .then(() => {
          validationForm.setErrors(name, []);
        })
        .catch((e) => {
          validationForm.setErrors(name, e.errors);
        });
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
        helperText={validationForm.interacted[name] && validationForm.errors[name]?.[0]}
        onChange={handleChange}
      />
    );
  };

export default withValidationProvider;
