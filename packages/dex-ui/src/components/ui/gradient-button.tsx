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
        height: '48px',
        boxShadow: '0px 10px 20px 0px rgba(60, 118, 255, 0.15)',
        backgroundImage: loading || disabled ? undefined : bgPrimaryGradient,
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
