import React, { RefObject, useState } from 'react';

const onChangeParseDefault = (...args: any) => args;

const withValidationProvider =
  (Field: any, onChangeParse = onChangeParseDefault) =>
  ({
    validators = [],
    form,
    name,
    ...fieldProps
  }: {
    validators: ((v: any) => false | string)[];
    form: RefObject<{ [k: string]: string[] }>;
    name: string;
  }) => {
    const [error, setError] = useState<string[]>([]);

    const findErrors = (v: any) => {
      return validators.reduce<string[]>((acc, validate) => {
        const errorMessage = (validate(v) || '').replace('{v}', name);
        return errorMessage ? [...acc, errorMessage] : acc;
      }, []);
    };

    if (form?.current) {
      form.current[name] = findErrors(onChangeParse(fieldProps.value));
    }

    const handleChange = (...args: any[]) => {
      const newValue = onChangeParse(...args);
      const foundErrors = findErrors(newValue);
      setError(foundErrors);
      form.current[name] = foundErrors;
      fieldProps.onChange(name, ...args);
    };
    return (
      <Field
        {...fieldProps}
        error={Boolean(error.length)}
        onChange={handleChange}
      />
    );
  };

export default withValidationProvider;
