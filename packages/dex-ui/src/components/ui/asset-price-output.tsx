import { Box, Link } from '@mui/material';
import { formatFundsAmount } from 'dex-helpers';
import React, { useEffect, useState } from 'react';

type Output = {
  amount?: number;
  price: number;
  tickerFrom: string;
  tickerTo: string;
  secondary: boolean;
};

export default function AssetPriceOutput({
  amount,
  price, // rate price
  tickerFrom,
  tickerTo,
  secondary,
}: Output) {
  const [reversed, setReversed] = useState(false);
  // const [output, setOutput] = useState<Output>({
  //   price,
  //   tickerFrom,
  //   tickerTo,
  // });

  const togglePrice = () => {
    setReversed((v) => !v);
    // setOutput((v) => ({
    //   price: 1 / v.price,
    //   tickerFrom: v.tickerTo,
    //   tickerTo: v.tickerFrom,
    // }));
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

  const output = {
    price: reversed ? (amount || 1) * (1 / price) : amount || price,
    tickerFrom: reversed ? tickerTo : tickerFrom,
    tickerTo: reversed ? tickerFrom : tickerTo,
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignContent="center"
      marginTop={1}
    >
      {!secondary && (
        <Link
          sx={{ cursor: 'pointer' }}
          variant="body1"
          onClick={onClick}
          color="inherit"
        >
          Per 1 {output.tickerFrom}
        </Link>
      )}
      <Link
        sx={{ cursor: 'pointer' }}
        variant="body1"
        fontWeight={secondary ? 'normal' : 'bold'}
        color="inherit"
        onClick={onClick}
      >
        {formatFundsAmount(output.price, output.tickerTo)}
      </Link>
    </Box>
  );
}
