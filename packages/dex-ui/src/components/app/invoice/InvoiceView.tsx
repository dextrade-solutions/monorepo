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
  CopyData,
  CountdownTimer,
  AssetItem,
} from '../../ui';
import WalletList from '../wallet-list';
import { InvoiceStatus } from './constants';
import { useGlobalModalContext } from '../modals';
import { InvoiceCopyAmount } from './InvoiceCopyAmount';
import usePaymentAddress from './react-queries/mutations/usePaymentAddress';
import useCurrencies from './react-queries/queries/useCurrencies';
import { IInvoiceFull } from './types/entities';
import { Invoice as InvoiceNamespace } from './types/invoices';

export default function InvoiceView({
  invoice,
  connections: allConnections = [],
  onBack,
}: {
  invoice: IInvoiceFull;
  connections?: Connection[];
  onBack?: () => void;
}) {
  const [loadingWallet, setLoadingWallet] = useState<Connection>();
  const [connectedWallet, setConnectedWallet] = useState<Connection>();

  const { showModal } = useGlobalModalContext();
  const currencies = useCurrencies();
  const changeAddress = usePaymentAddress();
  const canCurrencyChange = Boolean(
    (invoice.supported_currencies?.length || 0) > 1,
  );

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
    await changeAddress.mutateAsync({ id, currency_id: currency.id });
    setConnectedWallet(null);
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

  const assetList = useMemo(() => {
    const supportedCurrencies = invoice.supported_currencies || [];
    const allCurrencies = currencies.data?.data || [];

    if (supportedCurrencies.length && allCurrencies.length && assetsDict) {
      // supportedCurrencies = [
      //   ...supportedCurrencies,
      //   {
      //     id: 9999,
      //     coin_id: 999,
      //     iso_with_network: 'BTC',
      //     type: 0,
      //     iso: 'BTC',
      //     native_currency_iso: 'BTC',
      //     token_type: 'LIGHTNING',
      //     network_name: 'BTC',
      //   }, // stub
      // ];
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
    // const withoutLightning = assetList.filter(
    //   (v) => v.extra.currency.token_type !== 'LIGHTNING',
    // ); // stub
    if (!paymentAssetId && assetList.length === 1 && !changeAddress.isPending) {
      onChangeAsset(assetList[0]);
    }
  }, [paymentAssetId, assetList, changeAddress.isPending, onChangeAsset]);

  const expirationTime = invoice.due_to
    ? new Date(invoice.due_to).getTime() - new Date().getTime()
    : null;

  const isTerminated = [
    InvoiceStatus.canceled,
    InvoiceStatus.success,
    InvoiceStatus.expired,
  ].includes(invoice.status);

  const primarySendAmount = Number(invoice.converted_amount_requested_f);
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

  return (
    <Box width="100%">
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

          {invoice.description && (
            <Alert
              sx={{ justifyContent: 'center' }}
              severity="info"
              icon={<Icon name="bookmark" />}
            >
              {invoice.description}
            </Alert>
          )}

          {invoice.amount_requested_f && (
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
                    <ListItemButton>
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
                          recipient: invoice.address,
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    <ListItemButton
                      className="bordered"
                      data-testid="qrcode-payment-uri"
                      disabled={changeAddress.isPending}
                      onClick={() =>
                        showModal({
                          name: 'QR_MODAL',
                          description: (
                            <Box>
                              <Alert severity="warning">
                                Autocomplete qr works only with{' '}
                                <strong>MetaMask</strong> and{' '}
                                <strong>TrustWallet</strong> apps. Do not scan
                                it in the address input, or you may lose your
                                funds permanently.
                              </Alert>
                            </Box>
                          ),
                          value: getQRuriPayment(
                            invoice.address,
                            invoice.amount_requested_f,
                            invoice.currency.network_name,
                            paymentAsset.contract,
                          ),
                        })
                      }
                    >
                      <ListItemAvatar>
                        <Icon ml={1} name="qr-code" size="xl" />
                      </ListItemAvatar>
                      <ListItemText
                        primary="Payment QR"
                        secondary="Autocomple address and amount"
                      />
                    </ListItemButton>
                    <ListItemButton
                      className="bordered"
                      data-testid="qrcode-address"
                      disabled={changeAddress.isPending}
                      onClick={() =>
                        showModal({
                          name: 'QR_MODAL',
                          showQrValue: true,
                          description: (
                            <Box textAlign="center">
                              <Typography color="text.secondary">
                                Use QR-code scanner in your wallet, to send to
                                the address below.
                              </Typography>
                              <Typography mt={3} variant="h6">
                                To send:{' '}
                                <strong>
                                  {secondaryDelta} {paymentAsset.symbol}
                                </strong>
                              </Typography>
                            </Box>
                          ),
                          value: invoice.address,
                        })
                      }
                    >
                      <ListItemAvatar>
                        <Icon ml={1} name="qr-code" size="xl" />
                      </ListItemAvatar>
                      <ListItemText
                        primary="Address and Amount QR"
                        secondary="Scan address"
                      />
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
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
