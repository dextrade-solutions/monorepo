import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from '@mui/material';
import { NetworkNames, formatFundsAmount, getUserAvatarUrl } from 'dex-helpers';
import { AdItem } from 'dex-helpers/types';
import { ExchangerUserPreview } from 'dex-ui';
import React from 'react';

import { useI18nContext } from '../../../hooks/useI18nContext';

interface IProps {
  exchange: AdItem;
  totalFee?: number;
}

export const P2PSwapSummary = ({ exchange: ad, totalFee = 0 }: IProps) => {
  const t = useI18nContext();

  const { fromCoin, toCoin } = ad;
  const exchangeRate = ad.coinPair.price;

  const showPaymentMethods =
    ad.fromCoin.networkName === NetworkNames.fiat ||
    ad.toCoin.networkName === NetworkNames.fiat;

  return (
    <Box className="p2p-swap-summary">
      <div>
        <ExchangerUserPreview
          marginBottom={3}
          avatarUrl={getUserAvatarUrl(ad.avatar)}
          name={ad.name}
          isActive={ad.isExchangerActive}
          lastActive={ad.lastActive}
          isKycVerified={ad.isKycVerified}
          rating={{
            exchangeCount: ad.exchangeCount,
            сompletionRate: ad.exchangeCompletionRate,
            totalRating: ad.rating.totalRating,
          }}
        />
        <Divider />
        <Typography marginTop={3} display="flex">
          <span className="flex-grow">Price per 1 {fromCoin.ticker}</span>
          <span className="row-summary__value">
            {formatFundsAmount(ad.priceInCoin2, toCoin.ticker)}
          </span>
        </Typography>
        <Typography display="flex">
          <span className="flex-grow">Price per 1 {toCoin.ticker}</span>
          <span className="row-summary__value">
            {formatFundsAmount(1 / ad.priceInCoin2, fromCoin.ticker)}
          </span>
        </Typography>
        {ad.minimumExchangeAmountCoin1 > 0 && (
          <>
            <Typography display="flex">
              <span className="flex-grow">{t('min')}</span>
              <span className="row-summary__value">
                {formatFundsAmount(
                  ad.minimumExchangeAmountCoin1,
                  fromCoin.ticker,
                )}
                {` (${formatFundsAmount(
                  ad.minimumExchangeAmountCoin2,
                  toCoin.ticker,
                )})`}
              </span>
            </Typography>
          </>
        )}
        {ad.maximumExchangeAmountCoin1 > 0 && (
          <>
            <Typography display="flex">
              <span className="flex-grow">{t('max')}</span>
              <span className="row-summary__value">
                {formatFundsAmount(
                  ad.maximumExchangeAmountCoin1,
                  fromCoin.ticker,
                )}
                {` (${formatFundsAmount(
                  ad.maximumExchangeAmountCoin2,
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
      </div>
      {showPaymentMethods && (
        <Box display="flex" marginTop={2}>
          <Typography className="flex-grow">Payment methods</Typography>
          {ad.paymentMethods
            .filter((paymentMethod) => !paymentMethod.data)
            .map((paymentMethod) => (
              <Box marginLeft={1}>
                <Chip size="small" label={paymentMethod.paymentMethod.name} />
              </Box>
            ))}
        </Box>
      )}
      {ad.exchangersPolicy && (
        <Box marginY={3}>
          <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
            <CardContent>
              <Alert severity="info">
                Please read the exchanger's terms and conditions before placing
                an order. Failure to do so may result in a failed transaction
                and financial losses.
              </Alert>
              <Typography marginTop={2} whiteSpace="pre-wrap">
                {ad.exchangersPolicy}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};
