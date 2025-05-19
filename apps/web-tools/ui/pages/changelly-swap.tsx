import { Box, Card, CardContent, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatFundsAmount, NetworkNames, TradeStatus } from 'dex-helpers';
import { AssetModel, CoinModel } from 'dex-helpers/types';
import { changellyService, coinPairsService } from 'dex-services';
import { Swap, useGlobalModalContext, Button, AdPreview } from 'dex-ui';
import { divide } from 'lodash';
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { parseCoin } from '../../app/helpers/p2p';
import StageDirectTransfer from '../components/app/p2p-swap-processing/stage-direct-transfer';
import { StageStatuses } from '../components/app/p2p-swap-processing/stage-statuses';
import { setAssetAccount } from '../ducks/app/app';
import { useRequestHandler } from '../hooks/useRequestHandler';

enum ChangellySwapStatus {
  created = 'created',
  waiting = 'waiting',
  exchanging = 'exchanging',
  sending = 'sending',
  failed = 'failed',
  refunded = 'refunded',
  hold = 'hold',
  overdue = 'overdue',
  expired = 'expired',
  finished = 'finished',
}

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

interface ChangellySwapProgressProps {
  depositAddress: string;
  asset: AssetModel;
  id: string;
  amount: number;
  onCancel: () => void;
}

const ChangellySwapProgress = ({
  depositAddress,
  id,
  amount,
  asset,
  onCancel,
}: ChangellySwapProgressProps) => {
  const [stageStatus, setStageStatus] = useState<StageStatuses>(null);

  // Fetch swap status with refetch interval
  const { data: swapStatus } = useQuery({
    queryKey: ['changellySwapStatus', id],
    queryFn: () => changellyService.getPairs({ externalId: id }),
    refetchInterval: 8000, // Refetch every 8 seconds
  });
  const txStatus = swapStatus?.data.transaction?.status as ChangellySwapStatus;

  // Map Changelly status to StageStatuses
  useEffect(() => {
    if (!txStatus) {
      return;
    }
    if (txStatus === ChangellySwapStatus.finished) {
      setStageStatus(StageStatuses.success);
    }
  }, [txStatus]);

  // Ensure asset has all required properties
  const assetModel: AssetModel = {
    name: asset.name || asset.symbol,
    symbol: asset.symbol,
    uid: asset.uid || asset.symbol.toLowerCase(),
    network: asset.network || NetworkNames.ethereum,
    isFiat: false,
    isNative: true,
    chainId: asset.chainId,
    decimals: asset.decimals,
    contract: asset.contract,
    standard: asset.standard,
    iso: asset.symbol.toLowerCase(),
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Card variant="outlined">
        <CardContent>
          <Box gap={2}>
            {txStatus === ChangellySwapStatus.finished ? (
              <>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  Swap Completed Successfully! 🎉
                </Typography>
                <Typography variant="body1" color="success.main">
                  Your funds have been exchanged successfully
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6">
                  {txStatus === ChangellySwapStatus.waiting
                    ? 'Waiting for deposit'
                    : 'Processing swap'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {txStatus || 'Unknown'}
                </Typography>
              </>
            )}

            <StageDirectTransfer
              key="directTransfer"
              from={assetModel}
              tradeId={id}
              amount={Number(amount)}
              tradeStatus={TradeStatus.new}
              depositAddress={depositAddress}
              value={stageStatus}
              onChange={setStageStatus}
              transactionHash={swapStatus?.data?.transaction?.hash || ''}
            />
            <Box mt={3} />
            <Button
              fullWidth
              variant={
                String(txStatus) === ChangellySwapStatus.finished
                  ? 'contained'
                  : 'outlined'
              }
              onClick={onCancel}
            >
              {String(txStatus) === ChangellySwapStatus.finished
                ? 'Start New Swap'
                : 'Cancel Swap'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

interface SwapResult {
  external_id: string;
  uid: string;
  deposit_address: string;
}

export default function ChangellySwap() {
  const [fromCoin, setFromCoin] = useState<AssetModel | null>(null);
  const [toCoin, setToCoin] = useState<AssetModel | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);
  const [isUpdatingFromBuy, setIsUpdatingFromBuy] = useState(false);
  const [isUpdatingFromSell, setIsUpdatingFromSell] = useState(false);
  const [connectedWallet, setIsWalletConnected] = useState<{
    address: string;
  } | null>(null);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [isCreatingSwap, setIsCreatingSwap] = useState(false);
  const { showModal } = useGlobalModalContext();
  const dispatch = useDispatch();
  const { handleRequest } = useRequestHandler();

  // Fetch available coins
  const { data: coinsResponse } = useQuery({
    queryKey: ['changellyCoins'],
    queryFn: () => changellyService.getCoins(),
  });

  // Helper function to handle USDT rate fetching and coin price updates
  const useUsdtRate = (coin: AssetModel | null) => {
    const { data: usdtRate } = useQuery({
      queryKey: ['usdtRate', coin?.symbol, 'USDT'],
      queryFn: () =>
        coinPairsService
          .getByAggregatorAndPair1({
            currencies: 'BINANCE',
            nameFrom: coin?.symbol || '',
            nameTo: 'USDT',
          })
          .then((res) => res.data),
      enabled: Boolean(coin?.symbol) && coin?.symbol !== 'USDT',
    });

    useEffect(() => {
      if (coin) {
        const newPriceInUsdt = usdtRate?.priceCoin1InUsdt;
        if (newPriceInUsdt) {
          if (coin === fromCoin) {
            setFromCoin({ ...coin, priceInUsdt: newPriceInUsdt });
          } else if (coin === toCoin) {
            setToCoin({ ...coin, priceInUsdt: newPriceInUsdt });
          }
        }
      }
    }, [usdtRate]);
  };

  // Use the helper for both coins
  useUsdtRate(fromCoin);
  useUsdtRate(toCoin);

  const coins =
    coinsResponse?.data
      ?.map((coin) => {
        try {
          return parseCoin(
            {
              ...coin,
              networkName: coin.network,
            } as CoinModel,
            coin.ticker === 'USDT' ? 1 : undefined,
            { providerNetwork: coin.providerNetwork },
          );
        } catch (error) {
          return null;
        }
      })
      .filter((coin): coin is AssetModel => coin !== null) || [];

  const pairsQuery = useMemo(() => {
    return {
      from: fromCoin?.symbol || '',
      to: toCoin?.symbol || '',
      fromNetwork: fromCoin?.providerNetwork || '',
      toNetwork: toCoin?.providerNetwork || '',
      amount: Number(amount),
    };
  }, [fromCoin, toCoin, amount]);

  // Clear selection when query changes
  useEffect(() => {
    setSelectedPair(null);
    setAmount('');
    setBuyAmount('');
  }, [fromCoin?.symbol, toCoin?.symbol]);

  // Fetch pairs when from and to coins are selected
  const { data: pairsResponse, isLoading: isPairsLoading } = useQuery({
    queryKey: ['changellyPairs', fromCoin?.symbol, toCoin?.symbol],
    queryFn: () => changellyService.getPairs1(pairsQuery),
    enabled: Boolean(fromCoin) && Boolean(toCoin),
  });

  const { data: exchangeInfoResponse } = useQuery({
    queryKey: ['changellyFee', pairsQuery],
    queryFn: () => changellyService.getExchangeInfo(pairsQuery),
    enabled: Boolean(fromCoin) && Boolean(toCoin) && Boolean(amount),
  });

  const pairs = (pairsResponse?.data || []) as Pair[];

  // Auto-select first pair when pairs are loaded
  useEffect(() => {
    if (pairs.length > 0 && !selectedPair) {
      setSelectedPair(pairs[0]);
    }
  }, [pairs, selectedPair]);

  const handleBuyAmountChange = (value: string) => {
    if (!selectedPair || isUpdatingFromSell) {
      return;
    }
    const rate = selectedPair.to_coins[0]?.networks[0]?.exchangeInfo.rate;
    if (!rate) {
      return;
    }

    setIsUpdatingFromBuy(true);
    try {
      const newSellAmount = divide(Number(value), rate);
      if (newSellAmount) {
        setAmount(newSellAmount.toFixed(5));
      } else {
        setAmount('');
      }
      setBuyAmount(value);
    } finally {
      setIsUpdatingFromBuy(false);
    }
  };

  const handleSellAmountChange = (value: string) => {
    if (!isUpdatingFromBuy) {
      setIsUpdatingFromSell(true);
      try {
        setAmount(formatFundsAmount(value));
        // Recalculate buy amount based on new sell amount
        const rate = selectedPair?.to_coins[0]?.networks[0]?.exchangeInfo.rate;
        if (rate) {
          const newBuyAmount = Number(value) * rate;
          setBuyAmount(newBuyAmount.toFixed(5));
        }
      } finally {
        setIsUpdatingFromSell(false);
      }
    }
  };

  const handleConnectWallet = () => {
    if (!fromCoin) {
      return;
    }

    showModal({
      name: 'SET_WALLET',
      asset: fromCoin,
      isToAsset: false,
      onChange: (v) => {
        setIsWalletConnected(v);
        dispatch(
          setAssetAccount({
            asset: fromCoin,
            assetAccount: v,
          }),
        );
      },
    });
  };
  // Handle swap creation
  const handleCreateSwap = async () => {
    if (!fromCoin || !toCoin || !amount || !selectedPair || !connectedWallet) {
      return;
    }
    setIsCreatingSwap(true);
    const result = await handleRequest(
      changellyService.create({
        amount: Number(amount),
        from_crypto: fromCoin.symbol,
        from_network: selectedPair.network,
        to_crypto: toCoin.symbol,
        to_network: selectedPair.to_coins[0]?.networks[0]?.network,
        to_address: connectedWallet.address,
      }),
    ).finally(() => {
      setIsCreatingSwap(false);
    });

    if (result?.data?.deposit_address) {
      setSwapResult(result.data);
    }
  };

  const handlePairSelect = (pair: Pair) => {
    setSelectedPair(pair);
  };

  const handleCancelSwap = () => {
    setSwapResult(null);
    setSelectedPair(null);
    setIsWalletConnected(null);
  };

  const exchangeInfo =
    exchangeInfoResponse?.data ||
    selectedPair?.to_coins[0]?.networks[0]?.exchangeInfo;

  const estimateFee =
    toCoin?.priceInUsdt && exchangeInfo
      ? (exchangeInfo.fee + exchangeInfo.networkFee) * toCoin.priceInUsdt
      : undefined;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Box textAlign="center" gutterBottom mb={2}>
        <Typography component="span" variant="h4" fontWeight="bold">
          Dextrade
        </Typography>
        <Typography component="span" ml={1} variant="h4" color="text.secondary">
          Swaps
        </Typography>
      </Box>

      <>
        <Swap
          assetsListBuy={coins}
          assetsListSell={coins}
          buyAsset={toCoin}
          sellAsset={fromCoin}
          loading={isPairsLoading}
          sellAmount={formatFundsAmount(amount)}
          buyAmount={formatFundsAmount(buyAmount)}
          onReverse={() => {
            setFromCoin(toCoin);
            setToCoin(fromCoin);
            setAmount('');
            setBuyAmount('');
          }}
          disabled={Boolean(swapResult)}
          disableReverse={false}
          onBuyAssetChange={setToCoin}
          onSellAssetChange={setFromCoin}
          onSellAmountChange={handleSellAmountChange}
          onBuyAmountChange={handleBuyAmountChange}
        />

        {/* Pairs List */}
        {!swapResult && pairs && pairs.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography
              ml={1}
              variant="caption"
              color="text.secondary"
              gutterBottom
            >
              Best Rate
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pairs.map((pair) => {
                const rate = pair.to_coins[0]?.networks[0]?.exchangeInfo.rate;
                const isSelected = selectedPair?.ticker === pair.ticker;
                return (
                  <Box
                    key={pair.ticker}
                    onClick={() => handlePairSelect(pair)}
                    sx={{
                      cursor: 'pointer',
                      border: isSelected ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <AdPreview
                      hideTickers
                      ad={{
                        id: Number(pair.coin),
                        name: 'Changelly',
                        fromCoin: {
                          ticker: pair.coin,
                          networkName: pair.network,
                          uuid: pair.coin,
                          networkType: pair.network,
                        },
                        toCoin: {
                          ticker: toCoin?.symbol || '',
                          networkName:
                            pair.to_coins[0]?.networks[0]?.network || '',
                          uuid: pair.to_coins[0]?.coin || '',
                          networkType:
                            pair.to_coins[0]?.networks[0]?.network || '',
                        },
                        coinPair: {
                          id: 0,
                          pair: `${pair.ticker}/${toCoin?.symbol || ''}`,
                          nameFrom: pair.name,
                          nameTo: toCoin?.name || '',
                          price: rate || 0,
                          priceCoin1InUsdt: fromCoin?.priceInUsdt || 0,
                          priceCoin2InUsdt: toCoin?.priceInUsdt || 0,
                          originalPrice: rate || 0,
                          currencyAggregator: 0,
                        },
                        reserveSum: Number(
                          pair.to_coins[0]?.networks[0]?.exchangeInfo.maxTo ||
                            0,
                        ),
                        minimumExchangeAmountCoin2: Number(
                          pair.to_coins[0]?.networks[0]?.exchangeInfo.minTo ||
                            0,
                        ),
                        maximumExchangeAmountCoin2: Number(
                          pair.to_coins[0]?.networks[0]?.exchangeInfo.maxTo ||
                            0,
                        ),
                        isExchangerActive: true,
                        isKycVerified: true,
                        officialMerchant: true,
                        exchangeCount: 0,
                        exchangeCompletionRate: 1,
                        rating: {
                          totalRating: 1,
                        },
                        lastActive: new Date().toISOString(),
                        avatar: '',
                        paymentMethods: [],
                        transactionFee: 0,
                      }}
                      timeToSwap={500000}
                      estimateFee={estimateFee}
                      fromTokenAmount={amount}
                      onClick={() => handlePairSelect(pair)}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
        {swapResult && (
          <>
            <ChangellySwapProgress
              asset={fromCoin}
              id={swapResult.external_id}
              amount={Number(amount)}
              depositAddress={swapResult.deposit_address}
              onCancel={handleCancelSwap}
            />
          </>
        )}
        {!swapResult && (
          <Button
            sx={{ mt: 3 }}
            gradient
            fullWidth
            variant="contained"
            onClick={connectedWallet ? handleCreateSwap : handleConnectWallet}
            disabled={
              !fromCoin || !toCoin || !amount || !selectedPair || isCreatingSwap
            }
          >
            {connectedWallet ? 'Create Swap' : 'Connect Wallet'}
          </Button>
        )}
      </>
    </Box>
  );
}
