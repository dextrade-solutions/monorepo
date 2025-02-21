import { Button as MuiButton, ButtonProps } from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import { bgPrimaryGradient } from '../../constants/common';

interface GradientButtonProps extends ButtonProps {
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  rounded?: boolean;
  gradient?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<GradientButtonProps> = ({
  loading,
  disabled,
  error,
  children,
  gradient,
  rounded,
  sx = {},
  ...rest
}) => {
  const gradientStyles = gradient
    ? {
        boxShadow: '0px 10px 20px 0px rgba(60, 118, 255, 0.15)',
        backgroundImage: !loading && !disabled ? bgPrimaryGradient : 'none',
        color: 'white',
      }
    : {};
  return (
    <MuiButton
      className={classNames({ 'btn-error': error })}
      sx={{
        ...sx,
        borderRadius: rounded ? 20 : undefined,
        ...gradientStyles,
      }}
      disabled={loading || disabled}
      size="large"
      {...rest} // Spread the rest of the props
    >
      {children}
    </MuiButton>
  );
};

export default Button;
