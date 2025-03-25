import { Box, Typography } from '@mui/material';
import React from 'react';
import { LoaderVideo } from '../../contexts/loader';

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
  text,
  textColor = 'text.secondary',
  sx = {},
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
      <LoaderVideo />
      {text && (
        <Typography mt={1} color={textColor}>
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default DexLoader;
