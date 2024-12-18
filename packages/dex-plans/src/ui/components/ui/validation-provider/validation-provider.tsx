import { useState } from 'react';

export const ValidateField = ({ validator, onChange, renderInput }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const handleChange = (e) => {
    const newValue = e.target.value;
    const errorMessage = validator(newValue);
    setValue(newValue);
    setError(errorMessage);
    onChange(!errorMessage);
  };
  return (
    <>
      {renderInput(handleChange)}
      {Boolean(errors.length) && <Typography>{errors.join(',')}</Typography>}
    </>
  );
};
