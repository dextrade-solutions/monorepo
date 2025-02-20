import { Box, Typography } from '@mui/material';
import React from 'react';

import Link from './Link';

const ItemRow: React.FC<{
  label: string;
  value: React.ReactNode | string | number;
}> = ({ label, value }) => {
  const isUrl =
    typeof value === 'string' &&
    (value.startsWith('http://') || value.startsWith('https://'));
  const renderValue = () => {
    if (isUrl) {
      return (
        <Link href={value as string} target="_blank" rel="noopener noreferrer">
          {value}
        </Link>
      );
    } else if (React.isValidElement(value)) {
      // Check if it's a React element
      return value;
    }
    return <Typography variant="body2">{value}</Typography>;
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body1" color="textSecondary">
        {label}
      </Typography>
      {renderValue()}
    </Box>
  );
};

export default ItemRow;
