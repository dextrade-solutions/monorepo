import {
  Card,
  CardActionArea,
  Box,
  Chip,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import {
  NetworkNames,
  formatFundsAmount,
  getStrPaymentMethodInstance,
  getUserAvatarUrl,
} from 'dex-helpers';
import { AdItem } from 'dex-helpers/types';
import { DextradeTypes } from 'dex-services';
import { useTranslation } from 'react-i18next';

import ExchangerUserPreview from '../exchanger-user-preview';

interface IProps {
  ad: AdItem;
  fromTokenAmount?: number;
  exchanger: DextradeTypes.UserModel;
  isSelfAd?: boolean;
  onClick?: () => void;
  getAvatarLink?: (url: string) => string;
}

const AdPreview = ({
  ad,
  fromTokenAmount = 0,
  isSelfAd,
  getAvatarLink = (url) => getUserAvatarUrl(url),
  onClick,
}: IProps) => {
  const { t } = useTranslation();
  const showPaymentMethods =
    ad.fromCoin.networkName === NetworkNames.fiat ||
    ad.toCoin.networkName === NetworkNames.fiat;
  const [reserve] = ad.reserve;
  return (
    <Card
      variant="outlined"
      sx={{ bgcolor: 'primary.light' }}
      onClick={onClick}
    >
      <CardActionArea>
        <CardContent>
          <Box display="flex" justifyContent="space-between" marginBottom={2}>
            <ExchangerUserPreview
              avatarUrl={getAvatarLink(ad.avatar)}
              name={ad.name}
              isActive={ad.isExchangerActive}
              lastActive={ad.lastActive}
              isKycVerified={ad.isKycVerified}
              isSelfAd={isSelfAd}
              rating={{
                exchangeCount: ad.exchangeCount,
                сompletionRate: ad.exchangeCompletionRate,
                totalRating: ad.rating.totalRating,
              }}
            />
            {Boolean(Number(fromTokenAmount)) && (
              <Typography color="success.main">
                ~{' '}
                {formatFundsAmount(
                  fromTokenAmount * ad.priceInCoin2,
                  ad.toCoin.ticker,
                )}
              </Typography>
            )}
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
            marginTop={1}
          >
            <Typography>Per 1 {ad.fromCoin.ticker}</Typography>
            <Typography fontWeight="bold" component="strong">
              {formatFundsAmount(ad.coinPair.price, ad.toCoin.ticker)}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
          >
            <Typography>Per 1 {ad.toCoin.ticker}</Typography>
            <Typography fontWeight="bold" component="strong">
              {formatFundsAmount(1 / ad.coinPair.price, ad.fromCoin.ticker)}
            </Typography>
          </Box>
          {showPaymentMethods ? (
            <Box display="flex" marginTop={2}>
              {ad.paymentMethods
                .filter((paymentMethod) => !paymentMethod.data)
                .map((paymentMethod) => (
                  <Box marginRight={1}>
                    <Chip label={paymentMethod.paymentMethod.name} />
                  </Box>
                ))}
            </Box>
          ) : (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignContent="center"
              >
                <Typography>{t('quantity')}</Typography>
                <Typography fontWeight="bold">
                  {formatFundsAmount(reserve.reserveInCoin2, ad.toCoin.ticker)}
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
                  {formatFundsAmount(
                    ad.maximumExchangeAmountCoin2 || reserve.reserveInCoin2,
                    ad.toCoin.ticker,
                  )}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AdPreview;
