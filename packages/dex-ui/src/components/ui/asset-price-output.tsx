import { Box, Link } from '@mui/material';
import { formatFundsAmount } from 'dex-helpers';
import React, { useEffect, useState } from 'react';

type Output = {
  price: number;
  tickerFrom: string;
  tickerTo: string;
};

export default function AssetPriceOutput({
  price,
  tickerFrom,
  tickerTo,
}: Output) {
  const [output, setOutput] = useState<Output>({
    price,
    tickerFrom,
    tickerTo,
  });

  const togglePrice = () => {
    setOutput((v) => ({
      price: 1 / v.price,
      tickerFrom: v.tickerTo,
      tickerTo: v.tickerFrom,
    }));
  };
  useEffect(() => {
    if (price < 1) {
      togglePrice();
    }
  }, []);

  const onClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    togglePrice();
  };
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignContent="center"
      marginTop={1}
    >
      <Link
        sx={{ cursor: 'pointer' }}
        variant="body1"
        onClick={onClick}
        color="inherit"
      >
        Per 1 {output.tickerFrom}
      </Link>
      <Link
        sx={{ cursor: 'pointer' }}
        variant="body1"
        fontWeight="bold"
        color="inherit"
        onClick={onClick}
      >
        {formatFundsAmount(output.price, output.tickerTo)}
      </Link>
    </Box>
  );
}
