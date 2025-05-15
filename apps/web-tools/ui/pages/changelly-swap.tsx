import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AssetModel, CoinModel } from 'dex-helpers/types';
import { changellyService } from 'dex-services';
import { Swap, useGlobalModalContext, Button } from 'dex-ui';
import React, { useState } from 'react';

import { parseCoin } from '../../app/helpers/p2p';

interface Pair {
  coin: string;
  network: string;
  name: string;
  ticker: string;
  to_coins: Array<{
    coin: string;
    networks: Array<{
      network: string;
      minExchAmount: number;
      exchangeInfo: {
        rate: number;
        fee: number;
        min: number;
        max: number;
      };
    }>;
  }>;
}

export default function ChangellySwap() {
  const [fromCoin, setFromCoin] = useState<AssetModel | null>(null);
  const [toCoin, setToCoin] = useState<AssetModel | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);
  const [connectedWallet, setIsWalletConnected] = useState(false);
  const { showModal } = useGlobalModalContext();

  // Fetch available coins
  const { data: coinsResponse } = useQuery({
    queryKey: ['changellyCoins'],
    queryFn: () => changellyService.getCoins(),
  });

  const coins =
    coinsResponse?.data
      ?.map((coin) => {
        try {
          return parseCoin({
            ...coin,
            networkName: coin.network,
          } as CoinModel);
        } catch (error) {
          return null;
        }
      })
      .filter((coin): coin is AssetModel => coin !== null) || [];

  // Fetch pairs when from and to coins are selected
  const { data: pairsResponse, isLoading: isPairsLoading } = useQuery({
    queryKey: ['changellyPairs', fromCoin?.symbol, toCoin?.symbol],
    queryFn: () =>
      changellyService.getPairs({
        from: fromCoin?.symbol || '',
        to: toCoin?.symbol || '',
      }),
    enabled: Boolean(fromCoin) && Boolean(toCoin),
  });

  const pairs = (pairsResponse?.data || []) as Pair[];

  // Calculate estimated amount
  const estimatedAmount = selectedPair?.to_coins[0]?.networks[0]?.exchangeInfo
    .rate
    ? Number(amount) * selectedPair.to_coins[0].networks[0].exchangeInfo.rate
    : 0;

  const handleConnectWallet = () => {
    if (!fromCoin) {
      return;
    }

    showModal({
      name: 'SET_WALLET',
      asset: fromCoin,
      isToAsset: false,
      onChange: (walletConnection) => {
        setIsWalletConnected(walletConnection);
      },
    });
  };

  // Handle swap creation
  const handleCreateSwap = async () => {
    if (!fromCoin || !toCoin || !amount || !selectedPair) {
      return;
    }

    try {
      const result = await changellyService.create({
        external_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        amount: Number(amount),
        from_crypto: fromCoin.symbol,
        from_network: selectedPair.network,
        to_crypto: toCoin.symbol,
        to_network: selectedPair.to_coins[0]?.networks[0]?.network,
        to_address: connectedWallet.address, // This should be provided by the user
      });

      // Handle successful swap creation
      console.log('Swap created:', result);
      // TODO: Navigate to swap status page or show success message
    } catch (error) {
      console.error('Failed to create swap:', error);
      // TODO: Show error message to user
    }
  };

  const handlePairSelect = (pair: Pair) => {
    setSelectedPair(pair);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Changelly Swap
      </Typography>

      <Swap
        assetsListBuy={coins}
        assetsListSell={coins}
        buyAsset={toCoin}
        sellAsset={fromCoin}
        loading={isPairsLoading}
        sellAmount={amount}
        buyAmount={estimatedAmount.toString()}
        onReverse={() => {
          setFromCoin(toCoin);
          setToCoin(fromCoin);
          setAmount('');
        }}
        disableReverse={false}
        onBuyAssetChange={setToCoin}
        onSellAssetChange={setFromCoin}
        onSellAmountChange={(value) => setAmount(value)}
        onBuyAmountChange={() => undefined} // Read-only
      />

      {/* Pairs List */}
      {pairs && pairs.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography ml={1} variant="caption" gutterBottom>
            Available Providers
          </Typography>
          <Grid container spacing={2}>
            {pairs.map((pair) => {
              const rate = pair.to_coins[0]?.networks[0]?.exchangeInfo.rate;
              const isSelected = selectedPair?.coin === pair.coin;
              return (
                <Grid item xs={12} key={pair.coin}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: isSelected ? '2px solid primary.main' : 'none',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handlePairSelect(pair)}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="h6">{pair.name}</Typography>
                          <Typography color="text.secondary">
                            Network: {pair.network}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="h6">
                            Rate: {rate ? rate.toFixed(8) : 'N/A'}
                          </Typography>
                          {rate && amount && (
                            <Typography color="text.secondary">
                              You get: {(Number(amount) * rate).toFixed(8)}{' '}
                              {toCoin?.symbol}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Action Button */}
      <Button
        sx={{ mt: 3 }}
        gradient
        fullWidth
        variant="contained"
        onClick={connectedWallet ? handleCreateSwap : handleConnectWallet}
        disabled={!fromCoin || !toCoin || !amount || !selectedPair}
      >
        {connectedWallet ? 'Create Swap' : 'Connect Wallet'}
      </Button>
    </Box>
  );
}
