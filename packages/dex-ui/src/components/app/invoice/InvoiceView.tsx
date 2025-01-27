import {
  Box,
  Button,
  Alert,
  Divider,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  MenuList,
  Skeleton,
  Typography,
} from '@mui/material';
// import assetsDict from 'dex-helpers/assets-dict';
import {
  determineConnectionType,
  useConnections,
  useEVMConnections,
  useTronConnections,
} from 'dex-connect';
import { formatCurrency, formatFundsAmount, shortenAddress } from 'dex-helpers';
import { AssetModel } from 'dex-helpers/types';
import _ from 'lodash';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useConfig } from 'wagmi';

import { InvoicePayBtn } from './InvoicePayBtn';
import InvoicePreloader from './InvoicePreloader';
import { Icon, UrlIcon, SelectCoinsItem, ButtonIcon } from '../../ui';
import WalletList from '../wallet-list';
import { InvoiceStatus } from './constants';
import usePaymentAddress from './react-queries/mutations/usePaymentAddress';
import useCurrencies from './react-queries/queries/useCurrencies';
import usePayment from './react-queries/queries/usePayment';

export default function Invoice() {
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
  const queryId =
    'ee15e1a4-3914-473e-be28-9210b66ebde8-f2986e9ec85616f783304f241b6a9f38';
  const payment = usePayment({ id: queryId });
  const currencies = useCurrencies();
  const changeAddress = usePaymentAddress();
  const config = useConfig();

  const paymentAssetId = payment.data?.currency.iso_with_network;
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
  const { data: connections = [] } = useConnections({
    wagmiConfig: config,
    connectionType,
  });

  const onChangeAsset = async (asset: AssetModel) => {
    const currency = currencies.data?.data.find((d) => d.iso === asset.iso);
    if (!currency) {
      throw new Error('onChangeAsset - Currency not found');
    }
    await changeAddress.mutateAsync({ id: queryId, currency_id: currency.id });
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

  if (isLoading || !payment.data) {
    return <InvoicePreloader />;
  }

  const isTerminated = [InvoiceStatus.canceled, InvoiceStatus.success].includes(
    payment.data.status,
  );
  const formattedAmount = formatFundsAmount(
    payment.data.amount_requested_f,
    payment.data.coin?.iso,
  );

  const alertParams = {
    [InvoiceStatus.canceled]: {
      severity: 'danger',
      text: 'Payment has been canceled, if you have questions, please contact support',
    },
    [InvoiceStatus.success]: {
      severity: 'success',
      text: `Payment received. Received ${formattedAmount}`,
    },
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        <Icon name="security-card" size="xl" />
        <Typography variant="h6">
          Pay {formatCurrency(payment.data.converted_amount_requested_f, 'usd')}
        </Typography>
      </Box>

      {isTerminated ? (
        <Box my={4}>
          <Alert severity={alertParams[payment.data.status].severity}>
            {alertParams[payment.data.status].text}
          </Alert>
        </Box>
      ) : (
        <>
          <Box
            m={1}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {changeAddress.isPending ? (
              <>
                <Skeleton width={80} />
                <Skeleton width={100} height={50} />
              </>
            ) : (
              <>
                <Box>
                  <Typography>Send: {formattedAmount}</Typography>
                </Box>
                <SelectCoinsItem
                  className="flex-shrink"
                  asset={paymentAsset}
                  placeholder={'Payment Asset'}
                  items={assetList}
                  onChange={onChangeAsset}
                  maxListItem={6}
                />
              </>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
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
                  <ListItemButton className="bordered">
                    <ListItemAvatar>
                      <Icon name="scan" />
                    </ListItemAvatar>
                    <ListItemText
                      primary="QR Code"
                      secondary="Scan qr code using any wallet"
                    />
                  </ListItemButton>
                  <ListItemButton className="bordered">
                    <ListItemAvatar>
                      <Icon name="copy" />
                    </ListItemAvatar>
                    <ListItemText
                      primary="Copy"
                      secondary="Manual copy address and send assets"
                    />
                  </ListItemButton>
                  <WalletList
                    wallets={connections}
                    connectingWallet={loadingWallet}
                    onSelectWallet={onSelectConnection}
                  />
                </>
              )}
            </MenuList>
          </Box>
        </>
      )}
    </Box>
  );
}
