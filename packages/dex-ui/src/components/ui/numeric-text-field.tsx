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
  reserve?: boolean;
  clearable?: boolean;
  placeholder?: string;
  InputProps: TextFieldProps['InputProps'];
  endAdornment?: ReactNode;
  textFieldProps?: Omit<TextFieldProps, 'value' | 'onChange' | 'InputProps'>; // Allow pass other text field props
}

const NumericTextField: React.FC<NumericTextFieldProps> = ({
  value,
  onChange,
  clearable = true,
  loading = false,
  reserve = false,
  placeholder = '0',
  endAdornment,
  textFieldProps,
  InputProps = {},
  ...rest
}) => {
  return (
    <NumericFormat
      value={value}
      decimalSeparator="."
      valueIsNumericString
      inputProps={{ inputMode: 'decimal' }}
      allowedDecimalSeparators={[',', '.']}
      customInput={TextField}
      disabled={loading}
      placeholder={placeholder}
      data-testid={reserve ? 'input-to' : 'input-from'}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        autoComplete: 'off',
        endAdornment: clearable && (
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
        ...InputProps,
      }}
      {...textFieldProps}
      {...rest}
    />
  );
};

export default NumericTextField;
