import { Button, ButtonProps } from '@mui/material';
import classNames from 'classnames';
import React from 'react';
import { bgPrimaryGradient } from '../../constants/common';

interface GradientButtonProps extends ButtonProps {
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  children: React.ReactNode;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  loading,
  disabled,
  error,
  children,
  sx = {},
  ...rest
}) => {
  return (
    <Button
      className={classNames({ 'btn-error': error })}
      fullWidth
      sx={{
        ...sx,
        backgroundImage: loading || disabled ? undefined : bgPrimaryGradient,
        // Add any other default styling you want here, for example:
        // color: (theme) => theme.palette.getContrastText(theme.palette.primary.main), // For better contrast
      }}
      disabled={loading || disabled}
      variant="contained"
      size="large"
      {...rest} // Spread the rest of the props
    >
      {children}
    </Button>
  );
};

export default GradientButton;
