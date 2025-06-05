import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import { AssetModel } from 'dex-helpers/types';
import {
  Button,
  SelectCoinsItem,
  useGlobalModalContext,
  NumericTextField,
  useForm,
} from 'dex-ui';
import { ArrowUpDown, ArrowDownUp, ShoppingCart } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import {
  PaybisConfig,
  CurrencyResponse,
  PaybisClient,
} from './paybis-api-client';
import { usePaybis } from './paybis-react-component';

interface Props {
  paybisConfig: PaybisConfig;
}

interface AssetInput {
  amount: string;
  loading: boolean;
}

interface WalletConnection {
  address: string;
  network: string;
}

const PaybisIntegrationPage: React.FC<Props> = ({ paybisConfig }) => {
  const { showModal } = useGlobalModalContext();
  const [selectedCurrency, setSelectedCurrency] = useState<AssetModel | null>(
    null,
  );
  const [selectedCurrencySell, setSelectedCurrencySell] =
    useState<AssetModel>();
  const [buyInput, setBuyInput] = useState<AssetInput>({
    amount: '',
    loading: false,
  });
  const [sellInput, setSellInput] = useState<AssetInput>({
    amount: '',
    loading: false,
  });
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [connectedWallet, setConnectedWallet] = useState<WalletConnection>();
  const [currencies, setCurrencies] = useState<CurrencyResponse[]>([]);
  const [currenciesSell, setCurrenciesSell] = useState<CurrencyResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const paybis = usePaybis(paybisConfig);

  const paybisRequestForm = useForm({
    method: async (_, mode) => {
      const amount = mode === 'buy' ? buyInput.amount : sellInput.amount;
      const defaultCurrencyCode = selectedCurrency?.id;
      const defaultCurrencyCodeSell = selectedCurrencySell?.id;
      const defaultBaseCurrencyCode = 'usd';

      const client = new PaybisClient(paybisConfig);

      const params: Record<string, string | number | boolean> = {
        currencyCode: defaultCurrencyCode,
        baseCurrencyCode: defaultBaseCurrencyCode,
        baseCurrencyAmount: amount,
        walletAddress,
        cryptoWalletAddressForRefund: walletAddress,
        showWalletAddressForm: false,
      };

      if (mode === 'sell') {
        params.currencyCode = defaultCurrencyCodeSell;
        params.defaultCurrencyCode = defaultCurrencyCodeSell;
        params.baseCurrencyCode = defaultBaseCurrencyCode; // fiat

        if (amount) {
          delete params.baseCurrencyAmount;
          params.quoteCurrencyAmount = amount;
        }
      }
      params.email = 'sshevaiv+@gmail.com';
      params.externalCustomerId = '1';

      const urlData = await client.createWidgetUrl(params, mode);
      window.location.replace(urlData.url);
    },
  });

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const currenciesData = await paybis.getCurrencies({
          side: 'buy',
        });
        const currenciesDataSell = await paybis.getCurrencies({
          side: 'sell',
        });
        const isTestMode = await paybis.isSandbox();

        let activeCurrencies;
        let activeCurrenciesSell;

        if (isTestMode) {
          activeCurrencies = currenciesData.filter(
            (c) => !c.isSuspended && c.supportsTestMode,
          );
          activeCurrenciesSell = currenciesDataSell.filter(
            (c) => !c.isSuspended && c.isSellSupported && c.supportsTestMode,
          );
        } else {
          activeCurrencies = currenciesData.filter(
            (c) => !c.isSuspended && c.supportsLiveMode,
          );
          activeCurrenciesSell = currenciesDataSell.filter(
            (c) => !c.isSuspended && c.isSellSupported && c.supportsLiveMode,
          );
        }

        setCurrencies(activeCurrencies);
        setCurrenciesSell(activeCurrenciesSell);

        setLoading(false);
      } catch (loadError) {
        console.error('Error loading currencies:', loadError);
        setLoading(false);
      }
    };
    loadCurrencies();
  }, [paybis]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  const onConnectWallet = (asset: CurrencyResponse) => {
    showModal({
      name: 'SET_WALLET',
      asset,
      allowPasteAddress: true,
      isToAsset: true,
      onChange: (v: WalletConnection) => {
        setConnectedWallet(v);
        setWalletAddress(v.address);
      },
    });
  };

  const onStartTrade = async (mode: 'buy' | 'sell') => {
    return paybisRequestForm.submit(mode);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography m={2} variant="h4" component="h1" fontWeight="bold">
          Paybis
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab label="Buy" />
          <Tab label="Sell" />
        </Tabs>

        {activeTab === 0 && (
          <Stack spacing={3}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <NumericTextField
                value={buyInput.amount}
                disabled={buyInput.loading}
                placeholder="0"
                allowNegative={false}
                sx={{ width: '100%', mr: 2 }}
                variant="standard"
                valueIsNumericString
                inputProps={{ inputMode: 'decimal' }}
                data-testid="input-buy"
                InputProps={{
                  disableUnderline: true,
                  style: {
                    fontSize: 25,
                  },
                  startAdornment: (
                    <Typography fontSize="inherit" mr={1}>
                      $
                    </Typography>
                  ),
                }}
                onChange={(v) => {
                  let value = v;
                  if (value.startsWith('.')) {
                    value = value.replace('.', '0.');
                  }
                  setBuyInput((prev) => ({ ...prev, amount: value }));
                }}
              />
              <SelectCoinsItem
                value={selectedCurrency}
                placeholder="Select coin"
                items={currencies}
                onChange={(v) => {
                  setSelectedCurrency(v);
                  setConnectedWallet(undefined);
                }}
                maxListItem={6}
              />
            </Box>

            {connectedWallet ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingCart size={20} />}
                onClick={() => {
                  onStartTrade('buy');
                }}
                fullWidth
                loading={loading}
              >
                Buy via Paybis
              </Button>
            ) : (
              <Button
                gradient
                onClick={() =>
                  selectedCurrency &&
                  onConnectWallet(selectedCurrency as CurrencyResponse)
                }
              >
                Connect wallet
              </Button>
            )}
          </Stack>
        )}

        {activeTab === 1 && (
          <Stack spacing={3}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <NumericTextField
                value={sellInput.amount}
                disabled={sellInput.loading}
                placeholder="0"
                allowNegative={false}
                sx={{ width: '100%', mr: 2 }}
                variant="standard"
                valueIsNumericString
                inputProps={{ inputMode: 'decimal' }}
                data-testid="input-sell"
                InputProps={{
                  disableUnderline: true,
                  style: {
                    fontSize: 25,
                  },
                  startAdornment: (
                    <Typography fontSize="inherit" mr={1}>
                      $
                    </Typography>
                  ),
                }}
                onChange={(v) => {
                  let value = v;
                  if (value.startsWith('.')) {
                    value = value.replace('.', '0.');
                  }
                  setSellInput((prev) => ({ ...prev, amount: value }));
                }}
              />
              <SelectCoinsItem
                value={selectedCurrencySell}
                placeholder="Select coin"
                items={currenciesSell}
                onChange={(v) => setSelectedCurrencySell(v)}
                maxListItem={6}
              />
            </Box>

            {connectedWallet ? (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ArrowDownUp size={20} />}
                onClick={() => {
                  onStartTrade('sell');
                }}
                fullWidth
                loading={loading}
              >
                Sell via Paybis
              </Button>
            ) : (
              <Button
                gradient
                onClick={() =>
                  selectedCurrencySell && onConnectWallet(selectedCurrencySell)
                }
              >
                Connect wallet
              </Button>
            )}
          </Stack>
        )}
      </Paper>

      {transactionId && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Transaction was created! ID: {transactionId}
        </Alert>
      )}
    </Container>
  );
};

export default PaybisIntegrationPage;
