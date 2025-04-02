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
import { Connection, determineConnectionType } from 'dex-connect';
import { formatCurrency, isMobileWeb, shortenAddress } from 'dex-helpers';
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
import { InvoiceStatus } from './constants';
import { useGlobalModalContext } from '../modals';
import { InvoiceCopyAmount } from './InvoiceCopyAmount';
import InvoiceQr from './InvoiceQr';
import usePaymentAddress from './react-queries/mutations/usePaymentAddress';
import useCurrencies from './react-queries/queries/useCurrencies';
import { IInvoiceFull } from './types/entities';

export default function InvoiceView({
  invoice,
  preview,
  hideHeader,
  showInvoiceUrlQr,
  showQrListItem,
  deeplinkUrl,
  connections: allConnections = [],
  onBack,
}: {
  showInvoiceUrlQr?: boolean;
  showQrListItem?: boolean;
  preview?: boolean;
  invoice: IInvoiceFull;
  hideHeader?: boolean;
  deeplinkUrl?: string;
  connections?: Connection[];
  onBack?: () => void;
}) {
  const [loadingWallet, setLoadingWallet] = useState<Connection>();
  const [connectedWallet, setConnectedWallet] = useState<Connection>();
  const [error, setError] = useState<string>();

  const { showModal, hideModal } = useGlobalModalContext();
  const currencies = useCurrencies();
  const changeAddress = usePaymentAddress({
    onError: () => {
      setError('Sorry, this coin is not available now');
    },
  });
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
    setError(undefined);
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
  const primaryRecievedAmount = parseFloat(
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

  const absDelta = Math.abs(primaryDelta || secondaryDelta);

  const deltaStr =
    absDelta < 1
      ? absDelta.toFixed(8).replace(/0+$/u, '')
      : formatCurrency(absDelta, primarySendCoin || secondarySendCoin);

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
        <InvoiceCopyAmount
          showInvoiceUrlQr={showInvoiceUrlQr}
          invoice={item}
          amount={secondaryDelta}
        />
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

  // TODO: open binance
  // function openBinanceWithRecipient(address: string) {
  //   const url = `binance://wallet?recipient=${address}`;
  //   window.location.href = url;
  // }
  const renderPaymentMethods = () => (
    <MenuList>
      {connectedWallet
        ? [
            <ListItemButton key="connected-wallet-info">
              <ListItemAvatar>
                <UrlIcon url={connectedWallet.icon} />
              </ListItemAvatar>
              <ListItemText
                primary={connectedWallet.name}
                secondary={shortenAddress(connectedWallet.connected.address)}
              />
            </ListItemButton>,
            <InvoicePayBtn
              key="invoice-pay-btn"
              payCallback={() =>
                connectedWallet.txSend({
                  asset: paymentAsset,
                  amount: secondaryDelta,
                  recipient: invoice.address,
                })
              }
            />,
          ]
        : [
            showQrListItem && (
              <ListItemButton
                key="qr-code-payment-uri"
                className="bordered"
                data-testid="qrcode-payment-uri"
                disabled={changeAddress.isPending || !paymentAsset || !invoice}
                onClick={() =>
                  showModal({
                    component: () => (
                      <Box m={2}>
                        <InvoiceQr
                          asset={paymentAsset}
                          amount={secondaryDelta}
                          invoice={invoice}
                        />
                      </Box>
                    ),
                  })
                }
              >
                <ListItemAvatar>
                  <Icon ml={1} name="qr-code" size="xl" />
                </ListItemAvatar>
                <ListItemText
                  primary="QR code"
                  secondary="Autocomplete invoice with QR code"
                />
              </ListItemButton>
            ),
            <ListItemButton
              key="copy-address"
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
            </ListItemButton>,
            // <ListItemButton
            //   key="copy-address"
            //   className="bordered"
            //   disabled={changeAddress.isPending}
            //   onClick={() => openBinanceWithRecipient(invoice.address)}
            // >
            //   <ListItemAvatar>
            //     <Icon ml={1} name="copy" size="xl" />
            //   </ListItemAvatar>
            //   <ListItemText primary="Binance" secondary="Open binance app" />
            // </ListItemButton>,
            !changeAddress.isPending && connections.length > 0 && (
              <WalletList
                key="wallet-list"
                wallets={connections}
                hideConnectionType
                deeplinkUrl={deeplinkUrl}
                connectingWallet={loadingWallet}
                onSelectWallet={onSelectConnection}
              />
            ),
          ]}
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
                <Button
                  sx={{ my: 2 }}
                  variant={secondarySendAmount ? 'text' : 'contained'}
                >
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

        {isPreviewMode && isOverpaid && absDelta > 1 && (
          <Alert sx={{ justifyContent: 'center', my: 2 }} severity="info">
            The invoice is overpaid by {deltaStr}. Please contact support for a
            refund.
          </Alert>
        )}
        {error && (
          <Alert sx={{ justifyContent: 'center', my: 2 }} severity="error">
            {error}
          </Alert>
        )}
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
