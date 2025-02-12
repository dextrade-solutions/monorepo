import { Box, Link } from '@mui/material';
import { formatCurrency, formatFundsAmount } from 'dex-helpers';
import React, { useEffect, useState } from 'react';

type Output = {
  price: number;
  tickerFrom: string;
  tickerTo: string;
  amount?: number;
  secondary?: boolean;
  disableToggle?: boolean;
};

export default function AssetPriceOutput({
  amount,
  price, // rate price
  tickerFrom,
  tickerTo,
  secondary,
  disableToggle,
}: Output) {
  const [reversed, setReversed] = useState(false);
  const togglePrice = () => {
    setReversed((v) => !v);
  };
  useEffect(() => {
    if (price < 1) {
      togglePrice();
    }
  }, []);

  const onClick = (e: Event) => {
    if (disableToggle) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    togglePrice();
  };

  const output = {
    price: reversed ? (amount || 1) * (1 / price) : amount || price,
    tickerFrom: reversed ? tickerTo : tickerFrom,
    tickerTo: reversed ? tickerFrom : tickerTo,
  };

  return (
    <Box display="flex" justifyContent="space-between" alignContent="center">
      {!secondary && (
        <Link
          sx={{ cursor: 'pointer', textDecoration: disableToggle && 'none' }}
          variant="body1"
          onClick={onClick}
          color="inherit"
        >
          Per 1 {output.tickerFrom}
        </Link>
      )}
      <Link
        sx={{ cursor: 'pointer', textDecoration: disableToggle && 'none' }}
        variant="body1"
        fontWeight={secondary ? 'normal' : 'bold'}
        color="inherit"
        onClick={onClick}
      >
        {formatCurrency(output.price, output.tickerTo)}
      </Link>
    </Box>
  );
}
