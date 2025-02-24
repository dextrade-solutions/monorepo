import {
  Box,
  Button,
  Alert,
  Divider,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuList,
  Skeleton,
  Typography,
  Avatar,
} from '@mui/material';
import { determineConnectionType, useConnections } from 'dex-connect';
import {
  formatCurrency,
  formatFundsAmount,
  getQRCodeURI,
  shortenAddress,
} from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import _ from 'lodash';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useConfig } from 'wagmi';

import { InvoicePayBtn } from './InvoicePayBtn';
import InvoicePreloader from './InvoicePreloader';
import {
  Icon,
  UrlIcon,
  SelectCoinsItem,
  CopyData,
  CountdownTimer,
  AssetItem,
} from '../../ui';
import WalletList from '../wallet-list';
import { InvoiceStatus } from './constants';
import { useGlobalModalContext } from '../modals';
import usePaymentAddress from './react-queries/mutations/usePaymentAddress';
import useCurrencies from './react-queries/queries/useCurrencies';
import usePayment from './react-queries/queries/usePayment';
import { Invoice as InvoiceNamespace } from './types/invoices';

export default function InvoiceView({
  id,
  onBack,
}: {
  id: string;
  onBack?: () => void;
}) {
  const [assetsDict, setAssetDict] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);

  const { showModal } = useGlobalModalContext();
  const payment = usePayment({ id });
  const currencies = useCurrencies();
  const changeAddress = usePaymentAddress();
  const config = useConfig();
  const canCurrencyChange = Boolean(payment.data?.converted_coin_id);

  const paymentAssetId = payment.data?.currency?.iso_with_network;
  const isLoading = payment.isLoading || currencies.isLoading || !assetsDict;

  const paymentAsset = useMemo<AssetModel | null>(() => {
    if (!paymentAssetId || !assetsDict) {
      return null;
    }
    return assetsDict[paymentAssetId];
  }, [paymentAssetId, assetsDict]);

  const connectionType = paymentAsset
    ? determineConnectionType(paymentAsset)
    : [];
  const {
    connections: { data: connections = [] },
  } = useConnections({
    wagmiConfig: config,
    connectionType,
  });

  useEffect(() => {
    import('dex-helpers/assets-dict').then((data) => {
      setAssetDict(data.default);
    });
  }, []);

  const onChangeAsset = async (asset: AssetModel) => {
    const currency = currencies.data?.data.find((d) => d.iso === asset.iso);
    if (!currency) {
      throw new Error('onChangeAsset - Currency not found');
    }
    await changeAddress.mutateAsync({ id, currency_id: currency.id });
    setConnectedWallet(null);
  };

  const onSelectConnection = useCallback(
    async (item: (typeof connections)[number]) => {
      setLoadingWallet(item);
      try {
        if (item.connected) {
          setConnectedWallet(item);
        } else {
          const connected = await item.connect();
          setConnectedWallet({ ...item, connected });
        }
        setLoadingWallet(null);
      } catch (e) {
        console.error(e);
        setLoadingWallet(null);
      }
    },
    [],
  );

  const assetList = useMemo(() => {
    let supportedCurrencies = payment.data?.supported_currencies || [];
    const allCurrencies = currencies.data?.data || [];

    if (supportedCurrencies.length && allCurrencies.length && assetsDict) {
      supportedCurrencies = [
        ...supportedCurrencies,
        {
          id: 9999,
          coin_id: 999,
          iso_with_network: 'BTC',
          type: 0,
          iso: 'BTC',
          native_currency_iso: 'BTC',
          token_type: 'LIGHTNING',
          network_name: 'BTC',
        }, // stub
      ];
      return _.compact(
        supportedCurrencies
          .filter((v) => assetsDict[v.iso_with_network])
          .map((v) => ({
            ...assetsDict[v.iso_with_network],
            extra: {
              currency: v,
            },
          })),
      );
    }
    return [];
  }, [currencies.data, assetsDict, payment]);

  useEffect(() => {
    const withoutLightning = assetList.filter(
      (v) => v.extra.currency.token_type !== 'LIGHTNING',
    ); // stub
    if (
      !paymentAssetId &&
      withoutLightning.length === 1 &&
      !changeAddress.isPending
    ) {
      onChangeAsset(withoutLightning[0]);
    }
  }, [paymentAssetId, assetList, changeAddress.isPending, onChangeAsset]);

  if (payment.isError) {
    return (
      <Alert severity="info">
        Invoice with id <strong>{id}</strong> cannot be loaded
      </Alert>
    );
  }

  const expirationTime = payment.data?.due_to
    ? new Date(payment.data.due_to).getTime() - new Date().getTime()
    : null;

  if (isLoading || !payment.data) {
    return <InvoicePreloader />;
  }

  const isTerminated = [
    InvoiceStatus.canceled,
    InvoiceStatus.success,
    InvoiceStatus.expired,
  ].includes(payment.data.status);

  const primarySendAmount = Number(payment.data.converted_amount_requested_f);
  const primarySendCoin = payment.data.converted_coin?.iso;
  const primaryRecievedAmount = Number(
    payment.data.converted_amount_received_total_f,
  );
  const primaryDelta = primarySendAmount - primaryRecievedAmount;

  const secondarySendAmount = Number(payment.data.amount_requested_f);
  const secondarySendCoin = payment.data.coin?.iso;
  const secondaryRecievedAmount = Number(payment.data.amount_received_total_f);
  const secondaryDelta = secondarySendAmount - secondaryRecievedAmount;

  let payStr = formatCurrency(
    primarySendAmount || secondarySendAmount,
    primarySendCoin || secondarySendCoin,
  );
  if (payment.data.status === InvoiceStatus.success) {
    payStr = `Paid ${payStr}`;
  } else {
    payStr = `Pay ${payStr}`;
  }

  const deltaStr = formatCurrency(
    Math.abs(primaryDelta || secondaryDelta),
    primarySendCoin || secondarySendCoin,
  );

  const mainIcon = <Icon size="lg" name="tag" />;

  const alertParams = {
    [InvoiceStatus.canceled]: {
      icon: <Icon size="lg" name="close" />,
      color: 'error.main',
      severity: 'danger',
      status: 'Payment cancelled',
      text: 'Payment has been canceled, if you have questions, please contact support',
    },
    [InvoiceStatus.success]: {
      icon: <Icon name="check" />,
      color: 'success.light',
      severity: 'success',
      status: 'Payment successful',
      text: `Payment received. Received ${secondarySendAmount}`,
    },
    [InvoiceStatus.pending]: {
      color: 'primary.main',
      icon: mainIcon,
      status: 'Payment awaiting',
    },
    [InvoiceStatus.unknwn]: {
      icon: mainIcon,
      color: 'primary.main',
      status: 'Choose a coin',
    },
    [InvoiceStatus.expired]: {
      icon: mainIcon,
      status: 'Expired',
    },
  };

  const showCopy = (item: InvoiceNamespace.View.Response) => {
    showModal({
      component: () => (
        <Box margin={3}>
          <Box display="flex">
            <Typography
              variant="h5"
              textAlign="left"
              className="flex-grow nowrap"
            >
              Amount
            </Typography>
            <Typography variant="h5">
              {secondaryDelta} {item.coin?.iso}
            </Typography>
          </Box>
          <Box display="flex">
            <Typography textAlign="left" className="flex-grow nowrap">
              Network
            </Typography>
            <Typography fontWeight="bold">
              {item.currency.network_name}
            </Typography>
          </Box>
          <Box my={2}>
            <Divider />
          </Box>
          <Box display="flex" textAlign="right" alignItems="center">
            <Typography textAlign="left" className="flex-grow nowrap">
              Address
            </Typography>
            <CopyData data={item.address} />
          </Box>
          <Box display="flex" textAlign="right" alignItems="center">
            <Typography textAlign="left" className="flex-grow nowrap">
              Link
            </Typography>
            <CopyData data={item.payment_page_url} title="Payment link" />
          </Box>
          <Alert sx={{ mt: 2 }} severity="info">
            Please send the exact amount to the provided address.
          </Alert>
        </Box>
      ),
    });
  };

  if (expirationTime !== null && expirationTime > 0) {
    alertParams[InvoiceStatus.pending].status = (
      <Typography display="flex">
        <Typography ml={1}>Expires in</Typography>
        <strong>
          <CountdownTimer
            timeStarted={new Date().getTime()}
            timerBase={expirationTime}
            timeOnly
            labelKey="Due to"
            infoTooltipLabelKey="Expiration Time"
          />
        </strong>
      </Typography>
    );
  }

  let isOverpaid = false;
  if (primaryDelta < 0) {
    isOverpaid = true;
  }
  let partiallyPaid = false;
  if (
    payment.data.status === InvoiceStatus.pending &&
    Number(primaryRecievedAmount) > 0
  ) {
    partiallyPaid = true;
  }

  const backbutton = onBack ? (
    <Button
      startIcon={<Icon name="arrow-left-dex" />}
      color="secondary"
      variant="text"
      onClick={onBack}
    >
      Back
    </Button>
  ) : null;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        {payment.data.logo_url ? (
          <Avatar
            alt="Payment Logo" // Provide alternative text for accessibility
            src={payment.data.logo_url}
            sx={{
              height: 50,
              width: 'auto',
              maxHeight: 100,
              maxWidth: 200,
              borderRadius: 0.5, // Maintain rounded corners
            }}
            variant="square" // Keep it square, remove for circular avatar
          />
        ) : (
          <Typography variant="h5">
            Dex<strong>Pay</strong>
          </Typography>
        )}

        {backbutton}
      </Box>
      <Box display="flex" alignItems="center" flexDirection="column">
        <Avatar
          sx={{
            my: 1,
            backgroundColor: alertParams[payment.data.status].color,
          }}
        >
          {alertParams[payment.data.status].icon}
        </Avatar>
        <Typography variant="h6">{payStr}</Typography>
        <Typography mb={2} color="text.secondary">
          {alertParams[payment.data.status].status}
        </Typography>
      </Box>
      {partiallyPaid && (
        <Alert severity="warning">
          <Typography>The invoice partially paid.</Typography>
          <Typography>
            Paid: {formatCurrency(primaryRecievedAmount, primarySendCoin)}
          </Typography>
          <Typography>Due: {deltaStr}</Typography>
        </Alert>
      )}
      {isTerminated && isOverpaid && (
        <Alert sx={{ justifyContent: 'center' }} severity="info">
          The invoice is overpaid by {deltaStr}. Please contact support for a
          refund.
        </Alert>
      )}
      {!isTerminated && (
        <>
          <Box m={2} display="flex" justifyContent="center" alignItems="center">
            {changeAddress.isPending ? (
              <>
                <Skeleton width={80} />
                <div className="flex-grow" />
                <Skeleton width={100} height={50} />
              </>
            ) : (
              <>
                {canCurrencyChange ? (
                  <Button variant={secondarySendAmount ? 'text' : 'contained'}>
                    <SelectCoinsItem
                      className="flex-shrink"
                      value={paymentAsset}
                      placeholder={'Select payment Asset'}
                      items={assetList}
                      onChange={onChangeAsset}
                      maxListItem={6}
                    />
                  </Button>
                ) : (
                  <AssetItem iconSize={35} asset={paymentAsset} />
                )}
                {Boolean(secondarySendAmount) && (
                  <>
                    <div className="flex-grow" />
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="flex-end"
                    >
                      <Typography variant="h6" fontWeight="bold">
                        <strong>~ {secondaryDelta}</strong>
                      </Typography>
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>

          {payment.data.description && (
            <Alert
              sx={{ justifyContent: 'center' }}
              severity="info"
              icon={<Icon name="bookmark" />}
            >
              {payment.data.description}
            </Alert>
          )}

          {payment.data.amount_requested_f && (
            <Box>
              <Divider sx={{ my: 2 }} />
              {connectedWallet ? (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography fontWeight="bold">Payment</Typography>
                  <Button
                    fontWeight="bold"
                    variant="outlined"
                    onClick={() => setConnectedWallet(null)}
                  >
                    Change payment method
                  </Button>
                </Box>
              ) : (
                <Typography fontWeight="bold">Select payment method</Typography>
              )}
              <MenuList>
                {connectedWallet ? (
                  <>
                    <ListItemButton onClick={connectedWallet.disconnect}>
                      <ListItemAvatar>
                        <UrlIcon url={connectedWallet.icon} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={connectedWallet.name}
                        secondary={shortenAddress(
                          connectedWallet.connected.address,
                        )}
                      />
                    </ListItemButton>
                    <InvoicePayBtn
                      payCallback={() =>
                        connectedWallet.txSend({
                          asset: paymentAsset,
                          amount: secondaryDelta,
                          recipient: payment.data.address,
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    {/* <ListItemButton
                      className="bordered"
                      // onClick={() => showQr(payment.data, secondaryDelta)}
                      onClick={() =>
                        showModal({
                          name: 'QR_MODAL',
                          description: `Use QR-code scanner in your wallet, to send ${secondaryDelta} ${paymentAsset.symbol} to the address below.`,
                          value: getQRCodeURI(
                            payment.data.address,
                            payment.data.amount_requested_f,
                            payment.data.currency.network_name,
                            paymentAsset.contract,
                          ),
                        })
                      }
                    >
                      <ListItemAvatar>
                        <Icon ml={1} name="qr-code" size="xl" />
                      </ListItemAvatar>
                      <ListItemText
                        primary="QR Code"
                        secondary="Scan qr code using any wallet"
                      />
                    </ListItemButton> */}
                    <ListItemButton
                      className="bordered"
                      onClick={() => showCopy(payment.data)}
                    >
                      <ListItemAvatar>
                        <Icon ml={1} name="copy" size="xl" />
                      </ListItemAvatar>
                      <ListItemText
                        primary="Copy"
                        secondary="Manual copy address and send assets"
                      />
                    </ListItemButton>
                    {!changeAddress.isPending && (
                      <WalletList
                        wallets={connections}
                        hideConnectionType
                        connectingWallet={loadingWallet}
                        onSelectWallet={onSelectConnection}
                      />
                    )}
                  </>
                )}
              </MenuList>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
