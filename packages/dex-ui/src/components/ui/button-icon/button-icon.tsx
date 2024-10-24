import { IconButton, IconButtonProps } from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import './button-icon.scss';

import Icon from '../icon';

export const ButtonIcon = ({
  ariaLabel,
  className,
  color = 'default',
  size = 'md',
  iconName,
  disabled,
  iconProps,
  ...props
}: {
  ariaLabel?: string;
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  iconName: string;
  disabled?: boolean;
  iconProps?: any;
} & IconButtonProps) => {
  return (
    <IconButton
      aria-label={ariaLabel}
      className={classNames(
        'mm-button-icon',
        `mm-button-icon--size-${size}`,
        {
          'mm-button-icon--disabled': disabled,
        },
        className,
      )}
      color={color}
      disabled={disabled}
      {...props}
    >
      <Icon name={iconName} size={size} {...iconProps} />
    </IconButton>
  );
};
