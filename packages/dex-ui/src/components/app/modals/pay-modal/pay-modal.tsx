import {
  Alert,
  AlertProps,
  Box,
  Divider,
  Link,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  formatCurrency,
  formatFundsAmount,
  getCoinIconByUid,
  NetworkNames,
} from 'dex-helpers';
import { Tariff } from 'dex-helpers/types';
import { exchangerService, paymentService } from 'dex-services';
import qs from 'qs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { showModal } from '../../../../ducks/modals';
import { ButtonIcon, UrlIcon } from '../../../ui';
import withModalProps from '../../hoc/with-modal-props';
import { ModalProps, PaymodalHandlers } from '../types';

const PAYMENT_SUPPORTED_NETWORKS = [
  NetworkNames.tron,
  NetworkNames.binance,
  NetworkNames.ethereum,
  NetworkNames.bitcoin,
];

const PayModal = ({
  plan,
  hideModal,
  paymodalHandlers,
}: {
  plan: Tariff;
  paymodalHandlers?: PaymodalHandlers;
} & ModalProps &
  AlertProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedAsset, setSelectedAsset] =
    useState<ReservedAssetWithUsdt | null>(null);
  const [deeplink, setDeeplink] = useState('');
  const [toSendAddress, setToSendAddress] = useState<string>('');
  const { data: supportedCurrencies = [] } = useQuery({
    queryKey: ['dexpay-supportedCurrencies'],
    queryFn: () =>
      paymentService.listAllCurrencies().then((response) => response.data),
  });
  const { data: paymentPrices = {} } = useQuery({
    queryKey: ['dexpay-paymentPrices'],
    queryFn: () => paymentService.getPrices().then((response) => response.data),
  });
  const {
    data: assets = [],
    isError,
    isLoading,
  } = useQuery<ReservedAsset[]>({
    queryKey: ['dexpay-assets'],
    queryFn: async () => {
      // TODO: reserve in response does not exist
      // return exchangerService.reserveList().then((response) => response.data);
      return paymodalHandlers
        .updateServerBalances()
        .then((response: any) => response.data);
    },
  });
  const { data: payments = [] } = useQuery({
    queryKey: ['dexpay-payments'],
    queryFn: () =>
      paymentService.getByUserId().then((response) => response.data),
  });
  const filteredAssets = assets
    .filter(
      (asset) =>
        supportedCurrencies.includes(asset.coin.ticker) &&
        PAYMENT_SUPPORTED_NETWORKS.includes(asset.coin.networkName) &&
        asset.reservedAmount > 0,
    )
    .map((asset) => ({
      ...asset,
      priceInUsdt: paymentPrices[asset.coin.ticker.toLowerCase()],
      balanceInUsdt:
        asset.reservedAmount * paymentPrices[asset.coin.ticker.toLowerCase()],
    }))
    .sort((a, b) => b.balanceInUsdt - a.balanceInUsdt);
  const payment = payments.find(
    (p) =>
      p.network === selectedAsset?.coin.networkName &&
      p.currency === selectedAsset?.coin.ticker,
  );
  const paymentsBySelectedAsset = payment?.payments || [];

  const toSendAmount = selectedAsset?.priceInUsdt
    ? plan.price / selectedAsset.priceInUsdt
    : null;

  function redirectToTransfer() {
    // Create a hidden iframe to trigger the deep link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deeplink;
    document.body.appendChild(iframe);
  }

  const choosePaymentAsset = async (asset: ReservedAssetWithUsdt) => {
    try {
      debugger;
      const to = await paymentService.createAddress({
        network: asset.coin.networkName,
        currency: asset.coin.ticker,
      });
      setToSendAddress(to.data);
      setSelectedAsset(asset);
      const params = {
        to: payment?.address,
        amount: toSendAmount,
        networkType: asset.coin.networkType,
        networkName: asset.coin.networkName,
        currency: asset.coin.ticker,
      };
      if (paymodalHandlers?.onChooseAsset) {
        paymodalHandlers?.onChooseAsset(params);
      } else {
        const deeplinkParams = qs.stringify(params);
        setDeeplink(
          payment && selectedAsset
            ? `com.dextrade://transfer?${deeplinkParams}`
            : '',
        );
        redirectToTransfer();
      }
    } catch (err: unknown) {
      dispatch(
        showModal({
          name: 'ALERT_MODAL',
          severity: 'error',
          text: err.response?.data?.message || err.message,
        }),
      );
    }
  };
  return (
    <Box padding={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">{plan.name}</Typography>
        <ButtonIcon size="lg" onClick={hideModal} iconName="close" />
      </Box>
      <Typography color="text.secondary" marginBottom={2}>
        {plan.description}
      </Typography>
      <Typography variant="h5" fontWeight="bold">
        {t('Total')} {formatCurrency(plan.price, 'usd')}
      </Typography>
      <Box marginY={2}>
        <Divider />
      </Box>
      {selectedAsset ? (
        <Box>
          <Typography variant="body2">
            {t('Please, send')}{' '}
            <strong>
              {formatFundsAmount(toSendAmount, selectedAsset.coin.ticker)}{' '}
              {selectedAsset.coin.networkType}
            </strong>{' '}
            {t('to')}{' '}
            <Link href={deeplink} variant="body2">
              {toSendAddress}
            </Link>
          </Typography>
          <Typography variant="body2" marginTop={2}>
            {t('Payments history')}:
          </Typography>
          <List>
            {paymentsBySelectedAsset.map((p) => (
              <ListItemText
                primary={
                  <Alert severity="success">
                    <Typography>
                      {p.amount} {p.currency}{' '}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {t('From')}: {p.fromAddress}
                    </Typography>
                  </Alert>
                }
              />
            ))}
            {paymentsBySelectedAsset.length === 0 && (
              <ListItemText
                secondary={t(
                  'Payments not found, please wait blockchain confirmation or contact support',
                )}
              />
            )}
          </List>
        </Box>
      ) : (
        <>
          <Typography>{t('Select asset and pay')}</Typography>
          <List>
            {filteredAssets.map((asset, idx) => (
              <Box
                sx={{ backgroundColor: 'secondary.dark' }}
                borderRadius={1}
                key={idx}
                marginTop={1}
              >
                <ListItemButton onClick={() => choosePaymentAsset(asset)}>
                  <ListItemAvatar>
                    <UrlIcon
                      size={40}
                      url={getCoinIconByUid(asset.coin.uuid)}
                    />
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <>
                        <Typography as="span">
                          {formatFundsAmount(
                            asset.reservedAmount,
                            asset.coin.ticker,
                          )}{' '}
                        </Typography>
                        <Typography as="span" color="text.secondary">
                          {asset.coin.networkType}
                        </Typography>
                      </>
                    }
                    secondary={formatCurrency(asset.balanceInUsdt, 'usd')}
                  />
                </ListItemButton>
              </Box>
            ))}

            {isLoading && (
              <Box>
                <Skeleton sx={{ mt: 1 }} height={60}></Skeleton>
                <Skeleton sx={{ mt: 1 }} height={60}></Skeleton>
                <Skeleton sx={{ mt: 1 }} height={60}></Skeleton>
              </Box>
            )}

            {!isLoading && !isError && !filteredAssets.length && (
              <Alert severity="info">
                Assets not found. Please try deposit any asset in your wallet
                and try again.
              </Alert>
            )}

            {isError && (
              <Alert severity="error">
                Something went wrong. Try to reload the app
              </Alert>
            )}
          </List>
        </>
      )}
    </Box>
  );
};

const AlertModalComponent = withModalProps(PayModal);

export default AlertModalComponent;
