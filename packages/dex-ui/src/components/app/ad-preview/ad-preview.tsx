import {
  Card,
  CardActionArea,
  Divider,
  Box,
  Chip,
  CardContent,
  Typography,
} from '@mui/material';
import { NetworkNames, formatFundsAmount, getUserAvatarUrl } from 'dex-helpers';
import { AdItem, UserModel } from 'dex-helpers/types';
import { sumBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { AssetItem, Icon } from '../../ui';
import ExchangerUserPreview from '../exchanger-user-preview';

interface IProps {
  ad: AdItem;
  fromTokenAmount?: number;
  exchanger: UserModel;
  isSelfAd?: boolean;
  hideTickers?: boolean;
  onClick?: () => void;
  getAvatarLink?: (url: string) => string;
}

const AdPreview = ({
  ad,
  fromTokenAmount = 0,
  isSelfAd,
  hideTickers,
  getAvatarLink = (url) => getUserAvatarUrl(url),
  onClick,
}: IProps) => {
  const { t } = useTranslation();
  const showPaymentMethods =
    ad.paymentMethods &&
    (ad.fromCoin.networkName === NetworkNames.fiat ||
      ad.toCoin.networkName === NetworkNames.fiat);
  // PROD_TODO:
  // const reserveInCoin2 = sumBy(ad.reserve, 'reserveInCoin2');
  const reserveInCoin2 = ad.reserveInCoin2;
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
              isOfficial={ad.officialMerchant}
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
                <Icon name="exchange-direction" size="xl" />
                <AssetItem iconSize={30} coin={ad.toCoin} alignReverse />
              </Box>
              <Box marginTop={1} marginBottom={1}>
                <Divider />
              </Box>
            </>
          )}

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
          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
          >
            <Typography>{t('quantity')}</Typography>
            <Typography fontWeight="bold">
              {formatFundsAmount(reserveInCoin2, ad.toCoin.ticker)}
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
                ad.maximumExchangeAmountCoin2 || reserveInCoin2,
                ad.toCoin.ticker,
              )}
            </Typography>
          </Box>

          {showPaymentMethods && (
            <Box display="flex" marginTop={2}>
              {ad.paymentMethods
                .filter((paymentMethod) => !paymentMethod.data)
                .map((paymentMethod) => (
                  <Box marginRight={1}>
                    <Chip label={paymentMethod.paymentMethod.name} />
                  </Box>
                ))}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AdPreview;
