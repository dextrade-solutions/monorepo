import {
  Card,
  CardActionArea,
  Box,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import {
  formatFundsAmount,
  relativeFromCurrentDate,
  getUserAvatarUrl,
} from 'dex-helpers';
import { DextradeTypes } from 'dex-services';
import { useTranslation } from 'react-i18next';

import { RatingOutput } from './rating-output';
import AssetItem from '../../ui/asset-item';
import Icon from '../../ui/icon';
import UrlIcon from '../../ui/url-icon';

interface IProps {
  ad: DextradeTypes.ExchangerModel;
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
  return (
    <Card
      variant="outlined"
      sx={{ bgcolor: 'primary.light' }}
      onClick={onClick}
    >
      <CardActionArea>
        <CardContent>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <UrlIcon size={40} url={getAvatarLink(ad.avatar)} />
              <Box marginLeft={2} textAlign="left">
                <Box display="flex" alignContent="center">
                  <Typography fontWeight="bold">{ad.name}</Typography>
                  {ad.isKycVerified && (
                    <Icon marginLeft={2} name="verified" color="primary" />
                  )}
                </Box>
                <Box display="flex" alignItems="center">
                  {isSelfAd && (
                    <Typography color="primary.main" variant="caption">
                      My ad
                    </Typography>
                  )}
                  {!isSelfAd && ad.isExchangerActive && (
                    <Typography variant="body2" color="success.main">
                      Online
                    </Typography>
                  )}
                  {!ad.isExchangerActive && ad.lastActive && (
                    <Typography variant="body2">
                      Active {relativeFromCurrentDate(ad.lastActive)}
                    </Typography>
                  )}
                </Box>
                <RatingOutput
                  exchangeCount={ad.exchangeCount}
                  exchangeCompletionRate={ad.exchangeCompletionRate}
                  {...ad.rating}
                />
              </Box>
            </Box>
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
              {formatFundsAmount(ad.priceInCoin2, ad.toCoin.ticker)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AdPreview;
