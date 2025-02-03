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
// import assetsDict from 'dex-helpers/assets-dict';
import { determineConnectionType, useConnections } from 'dex-connect';
import { formatCurrency, formatFundsAmount, shortenAddress } from 'dex-helpers';
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
import { useShowQr } from './hooks/use-show-qr';
import usePaymentAddress from './react-queries/mutations/usePaymentAddress';
import useCurrencies from './react-queries/queries/useCurrencies';
import usePayment from './react-queries/queries/usePayment';
import { Invoice as InvoiceNamespace } from './types/invoices';

export default function Invoice({ id }: { id: string }) {
  const [assetsDict, setAssetDict] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);

  const loadJson = async () => {
    const jsonData = await import('dex-helpers/assets-dict');
    setAssetDict(jsonData.default);
  };
  useEffect(() => {
    loadJson();
  }, []);
  const { showModal } = useGlobalModalContext();
  const payment = usePayment({ id });
  const currencies = useCurrencies();
  const changeAddress = usePaymentAddress();
  const config = useConfig();
  const showQr = useShowQr();
  const canCurrencyChange = Boolean(payment.data?.converted_coin_id);
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
              {item.amount_requested_f} {item.coin?.iso}
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

  const paymentAssetId = payment.data?.currency?.iso_with_network;
  const isLoading = payment.isLoading || currencies.isLoading;

  const paymentAsset = useMemo(() => {
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
    if (currencies.data && assetsDict) {
      return _.compact(currencies.data.data.map((v) => assetsDict[v.iso]));
    }
    return [];
  }, [currencies.data, assetsDict]);

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

  const primarySendAmount =
    payment.data.converted_amount_requested_f ||
    payment.data.amount_requested_f;
  const primarySendCoin =
    payment.data.converted_coin?.iso || payment.data.coin?.iso;
  const secondarySendAmount =
    payment.data.amount_requested_f &&
    formatFundsAmount(payment.data.amount_requested_f, payment.data.coin?.iso);

  const alertParams = {
    [InvoiceStatus.canceled]: {
      severity: 'danger',
      status: 'Payment cancelled',
      text: 'Payment has been canceled, if you have questions, please contact support',
    },
    [InvoiceStatus.success]: {
      severity: 'success',
      status: 'Payment successful',
      text: `Payment received. Received ${secondarySendAmount}`,
    },
    [InvoiceStatus.pending]: {
      status: 'Payment awaiting',
    },
    [InvoiceStatus.unknwn]: {
      status: 'Payment awaiting',
    },
    [InvoiceStatus.expired]: {
      status: 'Expired',
    },
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

  return (
    <Box>
      <Box display="flex" alignItems="center" flexDirection="column">
        <Box my={1}>
          {payment.data.logo_url ? (
            <Avatar
              alt="Payment Logo" // Provide alternative text for accessibility
              src={payment.data.logo_url}
              sx={{
                height: 50,
                width: 'auto',
                // minWidth: 100,
                maxHeight: 100,
                maxWidth: 200,
                borderRadius: 0.5, // Maintain rounded corners
                bgcolor: 'grey.200', // Optional: background color if image fails to load
              }}
              variant="square" // Keep it square, remove for circular avatar
            />
          ) : (
            <Icon size="xl" name="tag" />
          )}
        </Box>
        <Typography variant="h6">
          Pay {formatCurrency(primarySendAmount, primarySendCoin)}
        </Typography>
        <Typography mb={2} color="text.secondary">
          {alertParams[payment.data.status].status}
        </Typography>
      </Box>

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
                      asset={paymentAsset}
                      placeholder={'Select payment Asset'}
                      items={assetList}
                      onChange={onChangeAsset}
                      maxListItem={6}
                    />
                  </Button>
                ) : (
                  <AssetItem iconSize={35} asset={paymentAsset} />
                )}
                {secondarySendAmount && (
                  <>
                    <div className="flex-grow" />
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="flex-end"
                    >
                      <Typography>
                        <strong>~ {secondarySendAmount}</strong>
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
                          amount: payment.data.amount_requested_f,
                          recipient: payment.data.address,
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    <ListItemButton
                      className="bordered"
                      onClick={() => showQr(payment.data)}
                    >
                      <ListItemAvatar>
                        <Icon ml={1} name="qr-code" size="xl" />
                      </ListItemAvatar>
                      <ListItemText
                        primary="QR Code"
                        secondary="Scan qr code using any wallet"
                      />
                    </ListItemButton>
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
