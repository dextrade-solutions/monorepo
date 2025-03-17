import { Box, Link } from '@mui/material';
import { formatCurrency } from 'dex-helpers';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Output = {
  price: number;
  tickerFrom: string;
  tickerTo: string;
  amount?: number;
  disableToggle?: boolean;
};

export default function AssetPriceOutput({
  amount,
  price, // rate price
  tickerFrom,
  tickerTo,
  disableToggle,
}: Output) {
  const { t } = useTranslation();
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
  const isPerOne = typeof amount !== 'number';
  const reversedPrice = 1 / price;
  const reversedAmount = isPerOne ? reversedPrice : amount * reversedPrice;
  const nonReversedAmount = isPerOne ? price : amount;

  const output = {
    value: reversed ? reversedAmount : nonReversedAmount,
    tickerFrom: reversed ? tickerTo : tickerFrom,
    tickerTo: reversed ? tickerFrom : tickerTo,
  };

  return (
    <Box display="flex" justifyContent="space-between" alignContent="center">
      {isPerOne && (
        <Link
          sx={{ cursor: 'pointer', textDecoration: disableToggle && 'none' }}
          variant="body1"
          mr={1}
          onClick={onClick}
          color="inherit"
          fontSize="inherit"
        >
          {t('perOne', { ticker: output.tickerFrom })}
        </Link>
      )}
      <Link
        sx={{
          cursor: 'pointer',
          textDecoration: disableToggle || (isPerOne && 'none'),
        }}
        variant="body1"
        fontWeight={isPerOne ? 'bold' : 'normal'}
        color="inherit"
        fontSize="inherit"
        onClick={onClick}
      >
        {formatCurrency(
          output.value,
          isPerOne ? output.tickerTo : output.tickerFrom,
        )}
      </Link>
    </Box>
  );
}
