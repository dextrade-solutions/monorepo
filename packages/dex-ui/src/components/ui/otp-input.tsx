import { TextFieldProps } from '@mui/material/TextField';
import { MuiOtpInput } from 'mui-one-time-password-input';
import React from 'react';

interface OtpInputProps {
  length?: number;
  onChange: (otp: string) => void;
  value?: string;
  textFieldProps?: Partial<TextFieldProps>; // Allow customization of individual text fields
  testId?: string; //  for testing
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 4,
  onChange,
  value = '',
  textFieldProps,
  testId = 'otp-input', // Default testId
}) => {
  return (
    <MuiOtpInput
      length={length}
      value={value}
      onChange={onChange}
      data-testid={testId}
      autoFocus
      TextFieldsProps={{
        variant: 'outlined', // Default Variant, can be overridden
        placeholder: '-', // Default Placeholder
        inputProps: { inputMode: 'numeric', pattern: '[0-9]*' }, // Enforces numeric input
        ...textFieldProps, // spreads custom TextFieldProps, overriding defaults if needed
      }}
    />
  );
};

export default OtpInput;
