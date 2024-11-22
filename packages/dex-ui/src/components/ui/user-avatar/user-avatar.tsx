import { Box, Typography } from '@mui/material';
import classnames from 'classnames';
import React, { useState } from 'react';

const DEFAULT_SIZE = 32;
const DEFAULT_BORDER_RADIUS = 8;

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
  const iconSize = size || DEFAULT_SIZE;
  const borderRadius = DEFAULT_BORDER_RADIUS;

  const imgSizes = {
    height: `${iconSize}px`,
    width: `${iconSize}px`,
    borderRadius: `${borderRadius}px`,
  };

  const handleOnError = () => {
    setIconError(true);
  };

  return (
    <Box
      display="flex"
      sx={{
        position: 'relative',
        '&::after': {
          content: '""',
          height: 9,
          width: 9,
          bgcolor: online ? '#00D509' : '#CDCDCD',
          position: 'absolute',
          right: 0,
          bottom: 0,
          borderRadius,
          borderStyle: 1,
          borderWidth: 1,
          borderColor: 'primary.light',
        },
      }}
    >
      {!iconError && icon ? (
        <img
          onError={handleOnError}
          src={icon}
          style={imgSizes}
          className={className}
          alt={name || 'icon'}
        />
      ) : (
        <Box position="relative">
          <Box
            padding={2}
            sx={{
              bgcolor: 'primary.main',
              opacity: 0.1,
              ...imgSizes,
            }}
          ></Box>
          <Typography
            sx={{
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              position: 'absolute',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {name?.charAt(0).toUpperCase() || ''}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
