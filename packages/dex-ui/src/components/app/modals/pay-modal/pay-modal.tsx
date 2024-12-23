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
  NetworkTypes,
} from 'dex-helpers';
import { Tariff } from 'dex-helpers/types';
import { paymentService } from 'dex-services';
import qs from 'qs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalModalContext } from '..';
import { TxStageStatuses } from '../../../../constants';
import { ButtonIcon, CopyData, TxSendStage, UrlIcon } from '../../../ui';
import { ModalProps, PaymodalHandlers } from '../types';

const PAYMENT_SUPPORTED_NETWORKS = [
  NetworkNames.tron,
  NetworkNames.binance,
  NetworkNames.ethereum,
  NetworkNames.bitcoin,
];

type ReservedAsset = any;

type PaymentParams = {
  asset: ReservedAsset;
  data: {
    to: string;
    amount: number;
    networkType: NetworkTypes;
    networkName: NetworkNames;
    currency: string;
  };
  deeplink: string;
};

const PayModal = ({
  plan,
  hideModal,
  paymodalHandlers,
}: {
  plan: Tariff;
  paymodalHandlers?: PaymodalHandlers;
} & ModalProps &
  AlertProps) => {
  const { showModal } = useGlobalModalContext();
  const { t } = useTranslation();
  const [paymentParams, setPaymentParams] = useState<PaymentParams>();
  const [paymentResult, setPaymentResult] = useState<{
    status: TxStageStatuses;
    hash?: string;
    error?: string;
  }>();
  const [paymentAddressLoading, setPaymentAddressLoading] = useState(false);
  const selectedAsset = paymentParams?.asset;
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

  function redirectToTransfer(deeplink: string) {
    // Create a hidden iframe to trigger the deep link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deeplink;
    document.body.appendChild(iframe);
  }

  const onPay = async (args: PaymentParams) => {
    setPaymentResult({
      status: TxStageStatuses.requested,
    });
    if (paymodalHandlers?.onChooseAsset) {
      try {
        const hash = await paymodalHandlers?.onChooseAsset(args.data);
        setPaymentResult({
          status: TxStageStatuses.success,
          hash,
        });
      } catch (e) {
        setPaymentResult({
          status: TxStageStatuses.failed,
          error: e.shortMessage || e.message,
        });
      }
    } else {
      redirectToTransfer(args.deeplink);
    }
  };

  const choosePaymentAsset = async (asset) => {
    setPaymentAddressLoading(true);
    try {
      const to = await paymentService.createAddress(
        {
          network: asset.coin.networkName,
          currency: asset.coin.ticker,
        },
        {
          format: 'text',
        },
      );
      const params = {
        to: to.data,
        amount: plan.price / asset.priceInUsdt,
        networkType: asset.coin.networkType,
        networkName: asset.coin.networkName,
        currency: asset.coin.ticker,
      };
      const payInfo = {
        data: params,
        asset,
        deeplink: qs.stringify(params),
      };
      setPaymentParams(payInfo);
      onPay(payInfo);
    } catch (err: unknown) {
      showModal({
        name: 'ALERT_MODAL',
        severity: 'error',
        text: err.response?.data?.message || err.error,
      });
    }
    setPaymentAddressLoading(false);
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
      <Box display="flex">
        <Typography className="flex-grow" variant="h5">
          {t('Total')}
        </Typography>
        {selectedAsset && (
          <Typography color="text.secondary" variant="h5" mr={1}>
            {formatFundsAmount(
              plan.price / selectedAsset.priceInUsdt,
              selectedAsset.coin.ticker,
            )}{' '}
          </Typography>
        )}
        <Typography variant="h5" fontWeight="bold">
          {formatCurrency(plan.price, 'usd')}
        </Typography>
      </Box>
      <Box marginY={2}>
        <Divider />
      </Box>
      {paymentParams ? (
        <Box>
          <Typography color="text.secondary">
            Recepient wallet address
          </Typography>
          <Typography marginBottom={2}>
            <Typography variant="body2">{paymentParams.data.to}</Typography>
          </Typography>
          <Box>
            <TxSendStage
              onRequest={() => onPay(paymentParams)}
              subtitle={
                paymentResult?.hash ? (
                  <Box display="flex" alignItems="center">
                    <Typography color="text.secondary" className="flex-grow">
                      Your tx hash
                    </Typography>
                    <CopyData
                      className="flex-shrink"
                      shorten
                      data={paymentResult.hash}
                    />
                  </Box>
                ) : null
              }
              status={paymentResult?.status}
              successText="Payment has been approved, wait for blockchain confirmation"
              failtureText={paymentResult?.error}
            />
          </Box>
          <Box>
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
        </Box>
      ) : (
        <>
          <Typography>{t('Select asset and pay')}</Typography>
          <List>
            {filteredAssets.map((asset, idx) => (
              <Box key={idx} marginTop={1}>
                <ListItemButton
                  disabled={paymentAddressLoading}
                  className="bordered"
                  onClick={() => choosePaymentAsset(asset)}
                >
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

export default PayModal;
