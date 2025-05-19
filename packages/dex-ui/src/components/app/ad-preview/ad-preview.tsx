import {
  Card,
  CardActionArea,
  Divider,
  Box,
  Chip,
  CardContent,
  Typography,
} from '@mui/material';
import {
  formatCurrency,
  formatDate,
  formatFundsAmount,
  getAdLimitPerExchange,
  getUserAvatarUrl,
} from 'dex-helpers';
import { AdItem, UserModel } from 'dex-helpers/types';
import { Fuel, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AssetItem, Icon } from '../../ui';
import AssetPriceOutput from '../../ui/asset-price-output';
import { Atom } from '../../ui/custom-icons';
import ExchangerUserPreview from '../exchanger-user-preview';

interface IProps {
  ad: AdItem;
  fromTokenAmount?: number;
  exchanger: UserModel;
  timeToSwap?: number;
  estimateFee?: number;
  isSelfAd?: boolean;
  hideTickers?: boolean;
  onClick?: () => void;
  getAvatarLink?: (url: string) => string;
}

const AdPreview = ({
  ad,
  timeToSwap,
  estimateFee,
  fromTokenAmount = 0,
  isSelfAd,
  hideTickers,
  getAvatarLink = (url) => getUserAvatarUrl(url),
  onClick,
}: IProps) => {
  const { t } = useTranslation();
  const reserveInCoin2 = getAdLimitPerExchange(ad);
  return (
    <Card
      variant="outlined"
      sx={{ bgcolor: 'primary.light' }}
      onClick={onClick}
    >
      <CardActionArea sx={{ fontSize: 'inherit' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" marginBottom={1}>
            <ExchangerUserPreview
              width="100%"
              avatarUrl={getAvatarLink(ad.avatar)}
              name={ad.name}
              isActive={ad.isExchangerActive}
              lastActive={ad.lastActive}
              isKycVerified={ad.isKycVerified}
              isSelfAd={isSelfAd}
              isOfficial={ad.officialMerchant}
              rating={{
                exchangeCount: ad.exchangeCount,
                сompletionRate: ad.exchangeCompletionRate,
                totalRating: ad.rating?.totalRating,
              }}
              endAdornment={
                Boolean(Number(fromTokenAmount)) && (
                  <Typography
                    className="flex-grow"
                    textAlign="right"
                    color="success.main"
                  >
                    ~{' '}
                    {formatCurrency(
                      fromTokenAmount * ad.coinPair.price,
                      ad.toCoin.ticker,
                    )}
                  </Typography>
                )
              }
            />
          </Box>
          {!hideTickers && (
            <>
              <Box marginTop={1} marginBottom={1}>
                <Divider />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <AssetItem iconSize={30} coin={ad.fromCoin} />
                {ad.isAtomicSwap ? (
                  <Atom />
                ) : (
                  <Icon name="exchange-direction" size="xl" />
                )}
                <AssetItem iconSize={30} coin={ad.toCoin} alignReverse />
              </Box>
              <Box marginTop={1} marginBottom={1}>
                <Divider />
              </Box>
            </>
          )}

          <AssetPriceOutput
            price={ad.coinPair.price}
            tickerFrom={ad.fromCoin.ticker}
            tickerTo={ad.toCoin.ticker}
            disableToggle
          />
          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
          >
            <Typography>{t('Available')}</Typography>
            <Typography fontWeight="bold">
              {formatCurrency(ad.reserveSum, ad.toCoin.ticker)}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
          >
            <Typography>{t('limits')}</Typography>
            <Typography fontWeight="bold">
              {formatFundsAmount(ad.minimumExchangeAmountCoin2 || 0)} —{' '}
              {formatCurrency(
                ad.maximumExchangeAmountCoin2 || reserveInCoin2,
                ad.toCoin.ticker,
              )}
            </Typography>
          </Box>

          {Boolean(ad.paymentMethods?.length) && (
            <Box marginTop={2}>
              {ad.paymentMethods.map((paymentMethod) => (
                <Box
                  key={paymentMethod.userPaymentMethodId}
                  display="inline-flex"
                  alignItems="center"
                  marginRight={2}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 14,
                      bgcolor: 'primary.main',
                      borderRadius: 1,
                      opacity: 0.5,
                    }}
                    marginRight={2}
                  />
                  <Typography>{paymentMethod.paymentMethod.name}</Typography>
                </Box>
              ))}
            </Box>
          )}
          {estimateFee && timeToSwap && (
            <Box mt={2}>
              {estimateFee && (
                <Chip
                  variant="outlined"
                  label={
                    <Typography display="flex" gap={1} alignItems="center">
                      <Fuel size={16} /> {formatCurrency(estimateFee, 'usd')}
                    </Typography>
                  }
                />
              )}
              {timeToSwap && (
                <Chip
                  variant="outlined"
                  sx={{ ml: 1 }}
                  label={
                    <Typography display="flex" gap={1} alignItems="center">
                      <Timer size={16} /> {formatDate(timeToSwap, "m'm'")}
                    </Typography>
                  }
                />
              )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AdPreview;
