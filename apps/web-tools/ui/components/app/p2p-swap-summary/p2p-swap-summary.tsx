import { Alert, Box, Card, CardContent, Typography } from '@mui/material';
import { formatFundsAmount, humanizePaymentMethodName } from 'dex-helpers';
import { AdItem } from 'dex-helpers/types';
import { Icon } from 'dex-ui';
import React from 'react';

import { useI18nContext } from '../../../hooks/useI18nContext';

interface IProps {
  exchange: AdItem;
  totalFee?: number;
}

export const P2PSwapSummary = ({ exchange, totalFee = 0 }: IProps) => {
  const t = useI18nContext();

  const { fromCoin, toCoin } = exchange;
  const exchangeRate = exchange.coinPair.price;

  return (
    <Box className="p2p-swap-summary">
      <div>
        <Typography display="flex">
          <strong className="flex-grow">{t('provider')}</strong>
          <strong className="row-summary__value">{exchange.name}</strong>
        </Typography>
        <Typography display="flex">
          <strong className="flex-grow">{t('status')}</strong>
          <strong className="row-summary__value">
            {exchange.isExchangerActive ? t('online') : t('offline')}
          </strong>
        </Typography>
        <Box display="flex" marginBottom={4}>
          <strong className="flex-grow">{t('rating')}</strong>
          <Box display="flex" alignItems="center">
            {/* <strong>{exchange.rating}</strong> */}
            <Icon name="star" size="sm" marginLeft={1} />
          </Box>
        </Box>
        <Typography display="flex">
          <span className="flex-grow">Price per 1 {fromCoin.ticker}</span>
          <span className="row-summary__value">
            {formatFundsAmount(exchange.priceInCoin2, toCoin.ticker)}
          </span>
        </Typography>
        <Typography display="flex">
          <span className="flex-grow">Price per 1 {toCoin.ticker}</span>
          <span className="row-summary__value">
            {formatFundsAmount(1 / exchange.priceInCoin2, fromCoin.ticker)}
          </span>
        </Typography>
        {exchange.minimumExchangeAmountCoin1 > 0 && (
          <>
            <Typography display="flex">
              <span className="flex-grow">{t('min')}</span>
              <span className="row-summary__value">
                {formatFundsAmount(
                  exchange.minimumExchangeAmountCoin1,
                  fromCoin.ticker,
                )}
                {` (${formatFundsAmount(
                  exchange.minimumExchangeAmountCoin2,
                  toCoin.ticker,
                )})`}
              </span>
            </Typography>
          </>
        )}
        {exchange.maximumExchangeAmountCoin1 > 0 && (
          <>
            <Typography display="flex">
              <span className="flex-grow">{t('max')}</span>
              <span className="row-summary__value">
                {formatFundsAmount(
                  exchange.maximumExchangeAmountCoin1,
                  fromCoin.ticker,
                )}
                {` (${formatFundsAmount(
                  exchange.maximumExchangeAmountCoin2,
                  toCoin.ticker,
                )})`}
              </span>
            </Typography>
          </>
        )}
        {/* Should we display user exchangerFee?
              {exchangerFeeCalulated > 0 && (
              <Typography display="flex">
                <span className="flex-grow">{t('exchangerFee')}</span>
                <span className="row-summary__value">
                  {exchangerFeeCalulated.toFixed(6)} {fromCoin.ticker}
                </span>
              </Typography>
            )} */}
        {totalFee > 0 && (
          <Typography display="flex">
            <span className="flex-grow">{t('transactionFee')}</span>
            <span className="row-summary__value">
              ~ {formatFundsAmount(totalFee / exchangeRate, fromCoin.ticker)}
            </span>
          </Typography>
        )}
        {exchange.paymentMethod && (
          <Typography display="flex" marginTop={4}>
            <span className="flex-grow">Payment method</span>
            <span className="row-summary__value">
              {humanizePaymentMethodName(
                exchange.paymentMethod.paymentMethod.name,
                t,
              )}
            </span>
          </Typography>
        )}
      </div>
      {exchange.exchangersPolicy && (
        <Box marginY={3}>
          <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
            <CardContent>
              <Alert severity="info">
                Please read the exchanger's terms and conditions before placing
                an order. Failure to do so may result in a failed transaction
                and financial losses.
              </Alert>
              <Typography marginTop={2} whiteSpace="pre-wrap">
                {exchange.exchangersPolicy}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};
