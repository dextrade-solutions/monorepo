import { Box, Typography } from '@mui/material';
import React from 'react';

interface DexLoaderProps {
  loading?: boolean;
  size?: number;
  text?: string;
  textColor?: string;
  sx?: object;
  videoProps?: React.DetailedHTMLProps<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  >;
}

const DexLoader: React.FC<DexLoaderProps> = ({
  loading = true,
  size = 150,
  text,
  textColor = 'text.secondary',
  sx = {},
  videoProps = {},
}) => {
  if (!loading) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <video
        width={`${size}px`}
        autoPlay
        loop
        muted
        playsInline
        {...videoProps}
      >
        <source src="/images/logo/logo-animated.mov" type="video/mp4" />
        <source src="/images/logo/logo-animated.webm" type="video/webm" />
      </video>
      {text && (
        <Typography mt={1} color={textColor}>
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default DexLoader;
