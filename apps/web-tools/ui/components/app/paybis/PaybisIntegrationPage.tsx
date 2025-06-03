import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Fade,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Button,
  SelectCoinsItem,
  useGlobalModalContext,
  NumericTextField,
} from 'dex-ui';
import {
  ArrowLeft,
  ArrowUpDown,
  ArrowDownUp,
  ShoppingCart,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { PaybisConfig, CurrencyResponse } from './paybis-api-client';
import { PaybisWidget, usePaybis } from './paybis-react-component';

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
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyResponse | null>(null);
  const [selectedCurrencySell, setSelectedCurrencySell] = useState<string>();
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
  const [showWidget, setShowWidget] = useState<boolean>(false);
  const [side, setSide] = useState<string>('buy');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const paybis = usePaybis(paybisConfig);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        setError(null);
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
        setError('Failed to load currencies. Please try again later.');
        setLoading(false);
      }
    };
    loadCurrencies();
  }, [paybis]);

  const handleTransactionSuccess = (id: string) => {
    setTransactionId(id);
    setShowWidget(false);
  };

  const handleTransactionError = (transactionError: Error) => {
    if (transactionError.message === 'Closed') {
      setShowWidget(false);
    } else {
      console.error('Error in paybis Widget:', transactionError);
      setError(`Transaction error: ${transactionError.message}`);
    }
  };

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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography m={2} variant="h4" component="h1" fontWeight="bold">
          Paybis
        </Typography>

        <Button
          color="primary"
          startIcon={<ArrowUpDown size={20} />}
          onClick={() => {
            setShowWidget(true);
            setSide('swap');
          }}
          loading={loading}
        >
          Swap via Paybis
        </Button>
      </Box>

      {!showWidget && (<Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light' }}>
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
                  className="flex-shrink"
                  // sx={{
                  //   border: 1,
                  //   p: 1,
                  //   borderRadius: 1,
                  //   borderColor: 'divider',
                  //   alignItems: 'center',
                  // }}
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
                    setShowWidget(true);
                    setError(null);
                    setSide('buy');
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

              <Button
                variant="contained"
                color="secondary"
                startIcon={<ArrowDownUp size={20} />}
                onClick={() => {
                  setShowWidget(true);
                  setError(null);
                  setSide('sell');
                }}
                fullWidth
                loading={loading}
              >
                Sell via Paybis
              </Button>
            </Stack>
          )}
        </Paper>
      )}

      <Fade in={showWidget}>
        <Box>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => setShowWidget(false)}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {transactionId && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Transaction was created! ID: {transactionId}
            </Alert>
          )}
          {showWidget && (
            <PaybisWidget
              config={paybisConfig}
              defaultCurrencyCode={selectedCurrency?.id}
              defaultCurrencyCodeSell={selectedCurrencySell?.id}
              defaultBaseCurrencyCode="usd"
              walletAddress={walletAddress}
              amount={Number(
                side === 'buy' ? buyInput.amount : sellInput.amount,
              )}
              side={side}
              onSuccess={handleTransactionSuccess}
              onError={handleTransactionError}
            />
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default PaybisIntegrationPage;
