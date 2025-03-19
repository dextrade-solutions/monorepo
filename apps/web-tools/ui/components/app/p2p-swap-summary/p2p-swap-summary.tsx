import { Alert, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { NetworkNames, getUserAvatarUrl } from 'dex-helpers';
import { AdItem } from 'dex-helpers/types';
import { ExchangerUserPreview, AssetPriceOutput } from 'dex-ui';
import React from 'react';

import { useI18nContext } from '../../../hooks/useI18nContext';

interface IProps {
  exchange: AdItem;
  totalFee?: number;
}

export const P2PSwapSummary = ({ exchange: ad }: IProps) => {
  const t = useI18nContext();

  const showPaymentMethods =
    ad.paymentMethods &&
    (ad.fromCoin.networkName === NetworkNames.fiat ||
      ad.toCoin.networkName === NetworkNames.fiat);

  const isMaxEqualReserve =
    ad.maximumExchangeAmountCoin2 &&
    ad.maximumExchangeAmountCoin2 === ad.reserveSum;

  return (
    <Box className="p2p-swap-summary">
      <div>
        <Box display="flex">
          <ExchangerUserPreview
            marginBottom={2}
            avatarUrl={getUserAvatarUrl(ad.avatar)}
            name={ad.name}
            isActive={ad.isExchangerActive}
            lastActive={ad.lastActive}
            isKycVerified={ad.isKycVerified}
            isOfficial={ad.officialMerchant}
            rating={{
              exchangeCount: ad.exchangeCount,
              сompletionRate: ad.exchangeCompletionRate,
              totalRating: ad.rating.totalRating,
            }}
          />
        </Box>
        {/* <Divider /> */}
        <Box mb={1}>
          <AssetPriceOutput
            price={ad.coinPair.price}
            tickerFrom={ad.fromCoin.ticker}
            tickerTo={ad.toCoin.ticker}
            isPerOne
          />
        </Box>
        <Typography display="flex" alignItems="center">
          <span className="flex-grow">{t('reserve')}</span> {/* Changed here */}
          <span className="row-summary__value">
            <AssetPriceOutput
              amount={ad.reserveSum} // in coin 2
              price={ad.coinPair.price}
              tickerFrom={ad.toCoin.ticker}
              tickerTo={ad.fromCoin.ticker}
            />
          </span>
        </Typography>
        {ad.minimumExchangeAmountCoin1 > 0 && (
          <Typography display="flex" alignItems="center">
            <span className="flex-grow">{t('min')}</span>
            <span className="row-summary__value">
              <AssetPriceOutput
                amount={ad.minimumExchangeAmountCoin1}
                price={1 / ad.coinPair.price}
                tickerFrom={ad.fromCoin.ticker}
                tickerTo={ad.toCoin.ticker}
              />
            </span>
          </Typography>
        )}
        {!isMaxEqualReserve && ad.maximumExchangeAmountCoin1 > 0 && (
          <Typography mb={1} display="flex" alignItems="center">
            <span className="flex-grow">{t('max')}</span>
            <span className="row-summary__value">
              <AssetPriceOutput
                amount={ad.maximumExchangeAmountCoin1}
                price={1 / ad.coinPair.price}
                tickerFrom={ad.fromCoin.ticker}
                tickerTo={ad.toCoin.ticker}
              />
            </span>
          </Typography>
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
      </div>
      {showPaymentMethods && (
        <Box display="flex" marginTop={2}>
          <Typography>{t('payment-methods')}</Typography> {/* Changed here */}
          <Box className="flex-grow" />
          <Box textAlign="right">
            {ad.paymentMethods.map((paymentMethod, idx) => (
              <Chip
                key={idx}
                sx={{ marginBottom: 1, marginLeft: 1 }}
                size="small"
                label={paymentMethod.paymentMethod.name}
              />
            ))}
          </Box>
        </Box>
      )}
      {ad.exchangersPolicy && (
        <Box marginY={3} border={1} borderRadius={1}>
          <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
            <CardContent>
              <Alert severity="info">
                {t('read_policy_alert')} {/* Changed here */}
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
