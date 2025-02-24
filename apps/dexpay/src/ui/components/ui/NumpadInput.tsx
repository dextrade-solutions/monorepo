import {
  Box,
  Grid,
  Grow,
  keyframes,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { Button } from 'dex-ui';
import { ArrowRight, Delete } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

const NumpadInput = ({
  value,
  onChange,
  decimalPlaces = 2,
  maxValue = Infinity,
}: {
  value: string;
  onChange: (value: string) => void;
  decimalPlaces?: number;
  maxValue?: number;
}) => {
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

  const handleClear = () => {
    onChange('');
  };

  const numberAnimation = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.1);
  }
  `;
  const AnimatedValue = styled(Typography)`
    animation: ${numberAnimation} 0.1s linear;
    transition: transform 0.1s;
    &:active {
      transform: scale(0.95);
    }
  `;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      <AnimatedValue
        color={value ? 'text.tertiary' : 'text.secondary'}
        variant="h4"
      >
        {value || 'Enter Amount'}
      </AnimatedValue>

      <Grid container spacing={1} sx={{ maxWidth: 300 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'Del'].map(
          (digit) => (
            <Grid item xs={4} key={digit}>
              <Button
                fullWidth
                variant="outlined"
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
                  fontSize: 20,
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
        {/* <Grid item xs={8}>
          <Button
            fullWidth
            variant="contained"
            color="tertiary"
            onClick={handleClear}
            sx={{
              height: 60,
              fontWeight: 'bold',
              fontSize: 20,
            }}
          >
            Clear
          </Button>
        </Grid> */}
        <Grow in={Boolean(value)}>
          <Grid item xs={12}>
            <Button
              fullWidth
              gradient
              // onClick={handleNext}
              sx={{
                height: 60,
                fontWeight: 'bold',
                fontSize: 20,
              }}
            >
              <ArrowRight />
            </Button>
          </Grid>
        </Grow>
      </Grid>
    </Box>
  );
};

export default NumpadInput;
