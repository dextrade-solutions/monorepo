import {
  Card,
  CardActionArea,
  Box,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import { formatFundsAmount, getUserAvatarUrl } from 'dex-helpers';
import { AdItem, UserModel } from 'dex-helpers/types';
import { useTranslation } from 'react-i18next';

import AssetItem from '../../ui/asset-item';
import Icon from '../../ui/icon';
import ExchangerUserPreview from '../exchanger-user-preview';

interface IProps {
  ad: AdItem;
  fromTokenAmount?: number;
  exchanger: UserModel;
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
  return (
    <Card
      variant="outlined"
      sx={{ bgcolor: 'primary.light' }}
      onClick={onClick}
    >
      <CardActionArea>
        <CardContent>
          <Box display="flex" justifyContent="space-between">
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
          <Box marginTop={1} marginBottom={1}>
            <Divider />
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <AssetItem coin={ad.fromCoin} />
            <Icon name="exchange-direction" size="xl" />
            <AssetItem coin={ad.toCoin} alignReverse />
          </Box>
          <Box marginTop={1} marginBottom={1}>
            <Divider />
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
          >
            <Typography>{t('quantity')}</Typography>
            <Typography>
              {formatFundsAmount(ad.reserveInCoin2, ad.toCoin.ticker)}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
          >
            <Typography>{t('limits')}</Typography>
            <Typography>
              {formatFundsAmount(ad.minimumExchangeAmountCoin2 || 0)} —{' '}
              {formatFundsAmount(
                ad.maximumExchangeAmountCoin2 || ad.reserveInCoin2,
                ad.toCoin.ticker,
              )}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
            marginTop={1}
          >
            <Typography>Per 1 {ad.fromCoin.ticker}</Typography>
            <Typography component="strong">
              {formatFundsAmount(ad.coinPair.price, ad.toCoin.ticker)}
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignContent="center"
          >
            <Typography>Per 1 {ad.toCoin.ticker}</Typography>
            <Typography component="strong">
              {formatFundsAmount(1 / ad.coinPair.price, ad.fromCoin.ticker)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AdPreview;
