import { Box, Typography } from '@mui/material';
import classnames from 'classnames';
import React, { useState } from 'react';

import './index.scss';

export default function UserAvatar({
  icon,
  size,
  className,
  name,
  online = false,
}: {
  icon: string;
  size: number;
  className?: string;
  name?: string;
  fallbackClassName?: string;
  online?: boolean;
  isOfficial?: boolean;
}) {
  const [iconError, setIconError] = useState(false);
  const style = size ? { height: `${size}px`, width: `${size}px` } : {};

  const handleOnError = () => {
    setIconError(true);
  };

  return (
    <Box
      display="flex"
      className={classnames('user-avatar', {
        'user-avatar--online': online,
      })}
      sx={{
        '&::after': {
          borderColor: 'primary.light',
        },
      }}
    >
      {!iconError && icon ? (
        <img
          onError={handleOnError}
          src={icon}
          style={style}
          className={className}
          alt={name || 'icon'}
        />
      ) : (
        <Box className="user-avatar__fallback">
          <Box
            className="user-avatar__fallback--bg"
            padding={2}
            borderRadius={0.4}
            style={style}
            sx={{
              bgcolor: 'primary.main',
              opacity: 0.1,
            }}
          ></Box>
          <Typography
            fontWeight="bold"
            className="user-avatar__fallback--letter"
          >
            {name?.charAt(0).toUpperCase() || ''}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
