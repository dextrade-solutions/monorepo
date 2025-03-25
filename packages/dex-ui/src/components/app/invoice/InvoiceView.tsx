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
  ListItem,
  Paper,
} from '@mui/material';
import { Connection, determineConnectionType } from 'dex-connect';
import { formatCurrency, getQRuriPayment, shortenAddress } from 'dex-helpers';
import assetsDict from 'dex-helpers/assets-dict';
import { AssetModel } from 'dex-helpers/types';
import _ from 'lodash';
import React, { useEffect, useMemo, useState, useCallback } from 'react';

import { InvoicePayBtn } from './InvoicePayBtn';
import {
  Icon,
  UrlIcon,
  SelectCoinsItem,
  CountdownTimer,
  AssetItem,
} from '../../ui';
import WalletList from '../wallet-list';
import { InvoiceStatus, PAYMENT_QR_SUPPORTED } from './constants';
import { useGlobalModalContext } from '../modals';
import { InvoiceCopyAmount } from './InvoiceCopyAmount';
import usePaymentAddress from './react-queries/mutations/usePaymentAddress';
import useCurrencies from './react-queries/queries/useCurrencies';
import { IInvoiceFull } from './types/entities';

export default function InvoiceView({
  invoice,
  preview,
  hideHeader,
  connections: allConnections = [],
  onBack,
}: {
  preview?: boolean;
  invoice: IInvoiceFull;
  hideHeader?: boolean;
  connections?: Connection[];
  onBack?: () => void;
}) {
  const [loadingWallet, setLoadingWallet] = useState<Connection>();
  const [connectedWallet, setConnectedWallet] = useState<Connection>();

  const { showModal, hideModal } = useGlobalModalContext();
  const currencies = useCurrencies();
  const changeAddress = usePaymentAddress();
  const paymentAssetId = invoice.currency?.iso_with_network;

  const paymentAsset = useMemo<AssetModel | null>(() => {
    if (!paymentAssetId || !assetsDict) {
      return null;
    }
    return assetsDict[paymentAssetId];
  }, [paymentAssetId]);

  const connectionType = paymentAsset
    ? determineConnectionType(paymentAsset)
    : [];
  const connections = allConnections.filter((item) =>
    connectionType.includes(item.connectionType),
  );

  const onChangeAsset = async (asset: AssetModel) => {
    const currency = currencies.data?.data.find((d) => d.iso === asset.iso);
    if (!currency) {
      throw new Error('onChangeAsset - Currency not found');
    }
    await changeAddress.mutateAsync({
      id: invoice.id,
      currency_id: currency.id,
    });
    setConnectedWallet(undefined);
  };

  const onSelectConnection = useCallback(async (item: Connection) => {
    setLoadingWallet(item);
    try {
      if (item.connected) {
        setConnectedWallet(item);
      } else {
        const connected = await item.connect();
        setConnectedWallet({ ...item, connected });
      }
      setLoadingWallet(undefined);
    } catch (e) {
      console.error(e);
      setLoadingWallet(undefined);
    }
  }, []);

  useEffect(() => {
    hideModal();
  }, [invoice.status]);

  const assetList = useMemo(() => {
    const supportedCurrencies = invoice.supported_currencies || [];
    const allCurrencies = currencies.data?.data || [];

    if (supportedCurrencies.length && allCurrencies.length && assetsDict) {
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
  }, [currencies.data, invoice]);

  useEffect(() => {
    if (
      !paymentAssetId &&
      assetList.length === 1 &&
      !changeAddress.isPending &&
      !changeAddress.isSuccess
    ) {
      onChangeAsset(assetList[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentAssetId, assetList, changeAddress.isPending]);

  const expirationTime = invoice.due_to
    ? new Date(invoice.due_to).getTime() - new Date().getTime()
    : null;

  const isTerminated = [
    InvoiceStatus.canceled,
    InvoiceStatus.success,
    InvoiceStatus.expired,
  ].includes(invoice.status);

  const isPreviewMode = isTerminated || preview;

  const canCurrencyChange =
    Boolean((invoice.supported_currencies?.length || 0) > 1) && !isPreviewMode;

  const primarySendAmount = Number(
    invoice.converted_amount_requested_f || invoice.amount_requested_f,
  );
  const primarySendCoin = invoice.converted_coin?.iso;
  const primaryRecievedAmount = Number(
    invoice.converted_amount_received_total_f,
  );
  const primaryDelta = primarySendAmount - primaryRecievedAmount;

  const secondarySendAmount = Number(invoice.amount_requested_f);
  const secondarySendCoin = invoice.coin?.iso;
  const secondaryRecievedAmount = Number(invoice.amount_received_total_f);
  const secondaryDelta = secondarySendAmount - secondaryRecievedAmount;
  let payStr = formatCurrency(
    primarySendAmount || secondarySendAmount,
    primarySendCoin || secondarySendCoin,
  );
  if (invoice.status === InvoiceStatus.success) {
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
      color: 'success.main',
      severity: 'success',
      status: 'Payment successful',
    },
    [InvoiceStatus.pending]: {
      color: 'primary.main',
      icon: mainIcon,
      status: 'Payment awaiting',
    },
    [InvoiceStatus.unknwn]: {
      icon: mainIcon,
      color: 'primary.main',
      status: 'Choosing coin',
    },
    [InvoiceStatus.expired]: {
      icon: mainIcon,
      status: 'Expired',
    },
  };

  const showCopy = (item: IInvoiceFull) => {
    showModal({
      component: () => (
        <InvoiceCopyAmount invoice={item} amount={secondaryDelta} />
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
    invoice.status === InvoiceStatus.pending &&
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

  const paymentQrWallets = paymentAsset
    ? PAYMENT_QR_SUPPORTED[paymentAsset.iso] || []
    : [];

  const renderPaymentMethods = () => (
    <MenuList>
      {connectedWallet ? (
        <>
          <ListItemButton>
            <ListItemAvatar>
              <UrlIcon url={connectedWallet.icon} />
            </ListItemAvatar>
            <ListItemText
              primary={connectedWallet.name}
              secondary={shortenAddress(connectedWallet.connected.address)}
            />
          </ListItemButton>
          <InvoicePayBtn
            payCallback={() =>
              connectedWallet.txSend({
                asset: paymentAsset,
                amount: secondaryDelta,
                recipient: invoice.address,
              })
            }
          />
        </>
      ) : (
        <>
          {paymentQrWallets.length > 0 && (
            <ListItemButton
              className="bordered"
              data-testid="qrcode-payment-uri"
              disabled={changeAddress.isPending}
              onClick={() =>
                showModal({
                  name: 'QR_MODAL',
                  hideDownloadQr: true,
                  title: 'Payment QR',
                  gradientProps: {
                    type: 'linear',
                    rotation: 45,
                    colorStops: [
                      { offset: 0, color: '#00C283' },
                      { offset: 0.4, color: '#3b82f6' },
                    ],
                  },
                  description: (
                    <Box>
                      <Typography textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                          Recipient
                        </Typography>
                        {shortenAddress(invoice.address)}
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{ bgcolor: 'secondary.dark', my: 2 }}
                      >
                        <MenuList>
                          <Typography p={1} variant="body2" fontWeight="bold">
                            Supported apps
                          </Typography>
                          {paymentQrWallets.map((wallet) => (
                            <ListItem key={wallet.name}>
                              <ListItemAvatar>
                                <UrlIcon size={40} url={wallet.icon} />
                              </ListItemAvatar>
                              <ListItemText primary={wallet.displayName} />
                            </ListItem>
                          ))}
                        </MenuList>
                      </Paper>

                      <Alert severity="warning">
                        Do not scan it in other apps, or you may lose your funds
                        permanently.
                      </Alert>
                    </Box>
                  ),
                  value: getQRuriPayment(
                    invoice.address,
                    invoice.amount_requested_f,
                    invoice.currency.network_name,
                    paymentAsset.contract,
                    paymentAsset?.decimals,
                  ),
                })
              }
            >
              <ListItemAvatar>
                <Icon ml={1} name="qr-code" size="xl" />
              </ListItemAvatar>
              <ListItemText
                primary="Payment QR"
                secondary="Autocomplete address and amount"
              />
            </ListItemButton>
          )}
          <ListItemButton
            className="bordered"
            data-testid="qrcode-address"
            disabled={changeAddress.isPending}
            onClick={() =>
              showModal({
                name: 'QR_MODAL',
                title: 'Address QR',
                hideDownloadQr: true,
                showQrValue: true,
                description: (
                  <Box textAlign="center">
                    <Typography color="text.secondary">Amount</Typography>
                    <Typography variant="h4">
                      <strong>
                        {secondaryDelta} {paymentAsset.symbol}
                      </strong>
                    </Typography>
                    <Typography color="text.secondary">Recipient</Typography>
                  </Box>
                ),
                value: invoice.address,
              })
            }
          >
            <ListItemAvatar>
              <Icon ml={1} name="qr-code" size="xl" />
            </ListItemAvatar>
            <ListItemText primary="Address QR" secondary="Scan address" />
          </ListItemButton>
          <ListItemButton
            className="bordered"
            disabled={changeAddress.isPending}
            onClick={() => showCopy(invoice)}
          >
            <ListItemAvatar>
              <Icon ml={1} name="copy" size="xl" />
            </ListItemAvatar>
            <ListItemText
              primary="Copy"
              secondary="Manual copy address and send assets"
            />
          </ListItemButton>
          {!changeAddress.isPending && connections.length > 0 && (
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
  );

  return (
    <Box width="100%">
      {!hideHeader && (
        <Box display="flex" justifyContent="space-between" mb={2}>
          {invoice.logo_url ? (
            <Avatar
              alt="Payment Logo" // Provide alternative text for accessibility
              src={invoice.logo_url}
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
      )}
      <Box display="flex" alignItems="center" flexDirection="column">
        <Avatar
          sx={{
            my: 1,
            backgroundColor: alertParams[invoice.status].color,
          }}
        >
          {alertParams[invoice.status].icon}
        </Avatar>
        <Typography variant="h6">{payStr}</Typography>
        <Typography mb={2} color="text.secondary">
          {alertParams[invoice.status].status}
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
      {isPreviewMode && isOverpaid && (
        <Alert sx={{ justifyContent: 'center', my: 2 }} severity="info">
          The invoice is overpaid by {deltaStr}. Please contact support for a
          refund.
        </Alert>
      )}
      <>
        <Box display="flex" justifyContent="center" alignItems="center">
          {changeAddress.isPending ? (
            <>
              <Skeleton width={80} />
              <div className="flex-grow" />
              <Skeleton width={100} height={50} />
            </>
          ) : (
            <>
              {canCurrencyChange && (
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
              )}
              {!canCurrencyChange && paymentAsset && (
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
                      <strong>
                        ~ {isPreviewMode ? secondarySendAmount : secondaryDelta}
                      </strong>
                    </Typography>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>

        {invoice.description && (
          <Alert
            sx={{ justifyContent: 'center' }}
            severity="info"
            icon={<Icon name="bookmark" />}
          >
            {invoice.description}
          </Alert>
        )}

        {invoice.amount_requested_f && !isPreviewMode && (
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
            {renderPaymentMethods()}
          </Box>
        )}
      </>
    </Box>
  );
}
