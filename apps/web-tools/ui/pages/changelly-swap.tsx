import {
  Box,
  Card,
  CardContent,
  Typography,
  Collapse,
  Paper,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  formatCurrency,
  formatFundsAmount,
  shortenAddress,
  TradeStatus,
} from 'dex-helpers';
import { AssetModel, CoinModel } from 'dex-helpers/types';
import { changellyService, coinPairsService } from 'dex-services';
import { Swap, Button, AdPreview, UrlIcon } from 'dex-ui';
import { divide } from 'lodash';
import React, { useState, useEffect, useMemo } from 'react';

import { parseCoin } from '../../app/helpers/p2p';
import StageDirectTransfer from '../components/app/p2p-swap-processing/stage-direct-transfer';
import { StageStatuses } from '../components/app/p2p-swap-processing/stage-statuses';
import { useAssetInput } from '../hooks/asset/useAssetInput';
import { useAdValidation } from '../hooks/useAdValidation';
import { useFee } from '../hooks/useFee';
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
  assetFrom: AssetModel;
  assetTo: AssetModel;
  id: string;
  amount: number;
  onCancel: () => void;
}

const ChangellySwapProgress = ({
  depositAddress,
  id,
  amount,
  assetFrom,
  assetTo,
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
  const networkFee = swapStatus?.data.transaction?.networkFee || 0;

  // Map Changelly status to StageStatuses
  useEffect(() => {
    if (!txStatus) {
      return;
    }
    if (txStatus === ChangellySwapStatus.finished) {
      setStageStatus(StageStatuses.success);
    }
  }, [txStatus]);

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
                <Typography variant="body2" color="text.secondary">
                  Network fee: {formatFundsAmount(networkFee || 0)} (
                  {formatCurrency(networkFee * assetTo.priceInUsdt, 'usd')}){' '}
                  {assetTo.symbol}
                </Typography>
              </>
            )}

            <StageDirectTransfer
              key="directTransfer"
              from={assetFrom}
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

function SetRecipient({
  assetInputFrom,
  assetInputTo,
  loading,
  handleCreateSwap,
}: {
  assetInputFrom: AssetInput;
  assetInputTo: AssetInput;
  loading: boolean;
  handleCreateSwap: () => void;
}) {
  const canUseSameAddress =
    (Boolean(assetInputFrom.asset.chainId) &&
      Boolean(assetInputTo.asset.chainId)) ||
    assetInputFrom.asset.network === assetInputTo.asset.network;

  const shouldSetRecipientWallet = !canUseSameAddress && !assetInputTo.account;

  const { fee: outgoingFee } = useFee({
    asset: assetInputFrom.asset,
    amount: assetInputFrom.value,
    from: assetInputFrom.account?.address,
    to: assetInputFrom.account?.address,
  });

  const insufficientNativeFee =
    outgoingFee &&
    (Number(assetInputFrom.balanceNative?.value) || 0) < outgoingFee;
  const { submitBtnText, hasValidationErrors } = useAdValidation({
    ad: {},
    assetInputFrom,
    assetInputTo,
    outgoingFee,
  });

  const onCreateSwap = () => {
    if (hasValidationErrors) {
      return;
    }
    if (insufficientNativeFee) {
      assetInputFrom.showDeposit({
        awaitingDepositAmount: outgoingFee,
        onSuccess: () => handleCreateSwap(),
      });
      return;
    }
    handleCreateSwap();
  };

  return (
    <>
      {!canUseSameAddress && (
        <Paper
          elevation={0}
          sx={{
            justifyContent: 'space-between',
            bgcolor: 'secondary.dark',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            py: 1,
            px: 2,
            mt: 3,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => assetInputTo.showConfigureWallet()}
        >
          <Typography variant="body1" color="text.secondary">
            Set recipient wallet
          </Typography>
          {!assetInputTo?.account && <Typography>{'Not set'}</Typography>}
          {assetInputTo.account && (
            <Box display="flex">
              <Typography textTransform="none">
                {shortenAddress(assetInputTo.account.address)}
              </Typography>
              <Box marginLeft={2}>
                <UrlIcon url={assetInputTo.wallet?.icon} />
              </Box>
            </Box>
          )}
        </Paper>
      )}
      <Button
        sx={{ mt: 3 }}
        gradient
        fullWidth
        variant="contained"
        onClick={
          assetInputFrom.account
            ? onCreateSwap
            : assetInputFrom.showConfigureWallet
        }
        disabled={loading || shouldSetRecipientWallet}
      >
        {assetInputFrom.account
          ? submitBtnText || `Create Swap`
          : 'Connect Wallet'}
      </Button>
      {assetInputFrom.account && (
        <Box
          mt={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
          onClick={() => assetInputFrom.showConfigureWallet()}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
          >
            Connected wallet: {shortenAddress(assetInputFrom.account?.address)}
          </Typography>
          <Box marginLeft={2}>
            <UrlIcon size={16} url={assetInputFrom.wallet?.icon} />
          </Box>
        </Box>
      )}
    </>
  );
}

interface SwapResult {
  external_id: string;
  uid: string;
  deposit_address: string;
}

export default function ChangellySwap() {
  const [fromCoin, setFromCoin] = useState<AssetModel | null>(null);
  const [toCoin, setToCoin] = useState<AssetModel | null>(null);
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);
  const [isUpdatingFromBuy, setIsUpdatingFromBuy] = useState(false);
  const [isUpdatingFromSell, setIsUpdatingFromSell] = useState(false);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [isCreatingSwap, setIsCreatingSwap] = useState(false);
  const assetInputFrom = useAssetInput({ asset: fromCoin });
  const assetInputTo = useAssetInput({ asset: toCoin, isToAsset: true });

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
      amount: assetInputFrom ? Number(assetInputFrom.amount) : undefined,
    };
  }, [fromCoin, toCoin, assetInputFrom.amount]);

  const clearSelectionAndInputs = () => {
    setSelectedPair(null);
    assetInputFrom.setInputAmount('');
    assetInputTo.setInputAmount('');
  };

  // Clear selection when query changes
  useEffect(() => {
    clearSelectionAndInputs();
  }, [assetInputFrom.asset?.symbol, assetInputTo.asset?.symbol]);

  // Fetch pairs when from and to coins are selected
  const { data: pairsResponse, isLoading: isPairsLoading } = useQuery({
    queryKey: ['changellyPairs', fromCoin?.symbol, toCoin?.symbol],
    queryFn: () => changellyService.getPairs1(pairsQuery),
    enabled: Boolean(fromCoin) && Boolean(toCoin),
  });

  const { data: exchangeInfoResponse } = useQuery({
    queryKey: ['changellyFee', pairsQuery],
    queryFn: () => changellyService.getExchangeInfo(pairsQuery),
    enabled:
      Boolean(fromCoin) && Boolean(toCoin) && Boolean(assetInputFrom.amount),
  });

  const pairs = (pairsResponse?.data || []) as Pair[];

  const exchangeInfo =
    exchangeInfoResponse?.data ||
    selectedPair?.to_coins[0]?.networks[0]?.exchangeInfo;
  const rate = exchangeInfo?.rate;
  const buyCoinTradeFee = exchangeInfo?.fee + exchangeInfo?.networkFee;
  const estimateFee = toCoin?.priceInUsdt
    ? buyCoinTradeFee * toCoin.priceInUsdt
    : undefined;

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
    if (!rate) {
      return;
    }

    setIsUpdatingFromBuy(true);
    try {
      const newSellAmount = divide(Number(value + buyCoinTradeFee), rate);
      if (value) {
        assetInputFrom.setInputAmount(newSellAmount.toFixed(5));
      } else {
        assetInputFrom.setInputAmount('');
      }
      assetInputTo.setInputAmount(value);
    } finally {
      setIsUpdatingFromBuy(false);
    }
  };

  const handleSellAmountChange = (value: string) => {
    if (!isUpdatingFromBuy) {
      if (!value) {
        assetInputFrom.setInputAmount('');
        assetInputTo.setInputAmount('');
        return;
      }
      setIsUpdatingFromSell(true);
      try {
        assetInputFrom.setInputAmount(formatFundsAmount(value));
        if (rate) {
          const newBuyAmount = Number(value) * rate - buyCoinTradeFee;
          if (newBuyAmount <= 0) {
            assetInputTo.setInputAmount('');
          } else {
            assetInputTo.setInputAmount(newBuyAmount.toFixed(5));
          }
        }
      } finally {
        setIsUpdatingFromSell(false);
      }
    }
  };
  // Handle swap creation
  const handleCreateSwap = async () => {
    if (!selectedPair) {
      return;
    }
    setIsCreatingSwap(true);
    const result = await handleRequest(
      changellyService.create({
        amount: assetInputFrom.amount,
        from_crypto: fromCoin.symbol,
        from_network: selectedPair.network,
        to_crypto: toCoin.symbol,
        to_network: selectedPair.to_coins[0]?.networks[0]?.network,
        to_address:
          assetInputTo.account?.address || assetInputFrom.account?.address,
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
  };

  return (
    <Box
      sx={{
        p: 1,
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '& > *': {
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      <Box textAlign="center" mb={2}>
        <Typography component="span" variant="h4" fontWeight="bold">
          Dextrade
        </Typography>
        <Typography component="span" ml={1} variant="h4" color="text.secondary">
          Swaps
        </Typography>
      </Box>

      <>
        <Swap
          buyBalance={assetInputTo.balance?.value}
          sellBalance={assetInputFrom.balance?.value}
          buyBalanceUsdt={assetInputTo.balance?.inUsdt}
          sellBalanceUsdt={assetInputFrom.balance?.inUsdt}
          assetsListBuy={coins}
          assetsListSell={coins}
          buyAsset={toCoin}
          sellAsset={fromCoin}
          loading={isPairsLoading}
          sellAmount={formatFundsAmount(assetInputFrom.amount || '')}
          buyAmount={formatFundsAmount(assetInputTo.amount || '')}
          onReverse={() => {
            setFromCoin(toCoin);
            setToCoin(fromCoin);
            clearSelectionAndInputs();
          }}
          disabled={Boolean(swapResult)}
          disableReverse={false}
          onBuyAssetChange={setToCoin}
          onSellAssetChange={setFromCoin}
          onSellAmountChange={handleSellAmountChange}
          onBuyAmountChange={handleBuyAmountChange}
        />

        {/* Pairs List */}
        <Collapse in={!swapResult && Boolean(pairs?.length)} timeout={200}>
          <Box sx={{ mt: 3 }} minHeight={270}>
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
                      fromTokenAmount={assetInputFrom.amount}
                      onClick={() => handlePairSelect(pair)}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Collapse>
        {swapResult && (
          <>
            <ChangellySwapProgress
              assetFrom={fromCoin}
              assetTo={toCoin}
              id={swapResult.external_id}
              amount={Number(assetInputFrom.amount)}
              depositAddress={swapResult.deposit_address}
              onCancel={handleCancelSwap}
            />
          </>
        )}
        {!swapResult && fromCoin && toCoin && (
          <>
            <SetRecipient
              key={`${fromCoin?.iso}-${toCoin?.iso}`}
              assetInputFrom={assetInputFrom}
              assetInputTo={assetInputTo}
              handleCreateSwap={handleCreateSwap}
              loading={isCreatingSwap}
            />
          </>
        )}
      </>
    </Box>
  );
}
