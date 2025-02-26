import { TextField, TextFieldProps, InputAdornment } from '@mui/material';
import classNames from 'classnames';
import React, { ChangeEvent, ReactNode } from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

import ButtonIcon from './button-icon';

interface NumericTextFieldProps
  extends Omit<NumericFormatProps, 'customInput' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  hasValidationErrors?: boolean;
  reserve?: boolean;
  placeholder?: string;
  endAdornment?: ReactNode;
  textFieldProps?: Omit<TextFieldProps, 'value' | 'onChange' | 'InputProps'>; // Allow pass other text field props
}

const NumericTextField: React.FC<NumericTextFieldProps> = ({
  value,
  onChange,
  loading = false,
  hasValidationErrors = false,
  reserve = false,
  placeholder = '0',
  endAdornment,
  textFieldProps,
  ...rest
}) => {
  return (
    <NumericFormat
      value={value}
      customInput={TextField}
      disabled={loading}
      placeholder={placeholder}
      decimalSeparator=","
      data-testid={reserve ? 'input-to' : 'input-from'}
      onValueChange={({ value: v }) => onChange(v)} // update value when formated
      InputProps={{
        autoComplete: 'off',
        inputMode: 'numeric',
        pattern: '[0-9]*',
        endAdornment: (
          <InputAdornment position="end">
            {Number(value) > 0 && !loading && (
              <ButtonIcon
                iconName="close"
                size="sm"
                onClick={() => onChange('')}
              />
            )}
            {endAdornment}
          </InputAdornment>
        ),
        ...(rest.InputProps || {}),
      }}
      {...textFieldProps}
      {...rest}
    />
  );
};

export default NumericTextField;
