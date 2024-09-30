import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from '../../../components/ui/select';

export const MultiSignatureCreatePageSignatures = ({
  title,
  options,
  onChange,
  value,
  defaultValue,
  ...rest
}) => {
  useEffect(() => {
    if (!value) {
      const initValue = defaultValue
        ? options.find((opt) => defaultValue === opt.value)
        : options[0];
      onChange(initValue);
    }
  }, [value, onChange, defaultValue, options]);

  return (
    <div className="multisig-create__signatures">
      <p>{title}</p>
      <Select
        onChange={onChange}
        options={options}
        value={value}
        defaultValue={defaultValue}
        {...rest}
      />
    </div>
  );
};

MultiSignatureCreatePageSignatures.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.exact({
      label: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
      value: PropTypes.oneOf([PropTypes.string, PropTypes.number]),
    }),
  ),
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
  defaultValue: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
};
