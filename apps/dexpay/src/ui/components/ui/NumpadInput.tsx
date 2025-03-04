import { Box, BoxProps, Grid } from '@mui/material';
import { Button } from 'dex-ui';
import { Delete } from 'lucide-react';
import React, { useRef, useEffect } from 'react';

const NumpadInput = ({
  value,
  onChange,
  decimalPlaces = 2,
  maxValue = Infinity,
  sx,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  decimalPlaces?: number;
  maxValue?: number;
} & BoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleClick = (digit: string) => {
    if (digit === '.' && value.includes('.')) {
      return; // Prevent multiple decimal points
    }
    if (digit === '0' && value === '0') {
      return;
    }
    if (digit === '.' && !value) {
      onChange('0.'); // Start with '0.' if only '.' is pressed
      return;
    }
    if (
      value.includes('.') &&
      digit !== '.' &&
      value.split('.')[1].length >= decimalPlaces
    ) {
      return; // Prevent extra digits after decimal
    }

    const newValue = value + digit;
    if (parseFloat(newValue) <= maxValue) {
      onChange(newValue);
    }
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  return (
    <Box
      sx={{
        boxShadow: '0px 0px 20px 0px #0000001A',
        borderRadius: 1,
        bgcolor: 'background.default',
        p: 2,
        ...sx,
      }}
      {...rest}
    >
      <Grid container spacing={1}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'Del'].map(
          (digit) => (
            <Grid item xs={4} key={digit}>
              <Button
                fullWidth
                color="tertiary"
                onClick={() => {
                  if (digit === 'Del') {
                    handleDelete();
                  } else {
                    handleClick(digit);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  height: 60,
                  fontWeight: 'bold',
                  fontSize: 30,
                  '&:hover': {
                    filter: 'brightness(1.1)',
                  },
                }}
              >
                {digit === 'Del' ? <Delete /> : digit}
              </Button>
            </Grid>
          ),
        )}
      </Grid>
    </Box>
  );
};

export default NumpadInput;
