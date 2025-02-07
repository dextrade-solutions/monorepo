import { TextField, InputAdornment } from '@mui/material';
import React, { useState } from 'react';

import ButtonIcon from './button-icon';

interface PasswordFieldProps
  extends React.ComponentPropsWithoutRef<typeof TextField> {
  showPassword?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  showPassword = false,
  ...props
}) => {
  const [show, setShow] = useState(showPassword);
  const handleClickShowPassword = () => setShow(!show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  return (
    <TextField
      {...props}
      type={show ? 'text' : 'password'}
      InputProps={{
        // Add InputProps for the icon
        endAdornment: (
          <InputAdornment position="end">
            <ButtonIcon
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              iconName={show ? 'eye-slash' : 'eye'}
              color="secondary"
            />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PasswordField;
