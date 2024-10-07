import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import { formatCurrency, formatFundsAmount, NetworkNames } from 'dex-helpers';
import {
  UserPaymentMethod,
  AdItem,
  AssetInputValue,
  AssetModel,
} from 'dex-helpers/types';
import { debounce, isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formatUnits } from 'viem';

import { getNative } from '../../../../app/helpers/p2p';
import { fetchRates } from '../../../../app/helpers/rates';
import { generateTxParams } from '../../../../app/helpers/transactions';
import P2PService from '../../../../app/services/p2p-service';
import {
  createSwapP2P,
  getFromTokenInputValue,
} from '../../../ducks/swaps/swaps';
import { AWAITING_SWAP_ROUTE } from '../../../helpers/constants/routes';
import { useAccount } from '../../../hooks/asset/useAccount';
import { useAdValidation } from '../../../hooks/useAdValidation';
import { useAssetBalance } from '../../../hooks/useAssetBalance';
import { useAuthP2P } from '../../../hooks/useAuthP2P';
import { useFee } from '../../../hooks/useFee';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { AppDispatch } from '../../../store/store';
import AssetAmountField from '../../ui/asset-amount-field';
import AssetItem from '../../ui/asset-item';
import { ButtonIcon } from '../../ui/button-icon';
import PaymentMethodPicker from '../modals/payment-method-picker';
import P2PSwapSummary from '../p2p-swap-summary';
import './index.scss';

interface IProps {
  ad: AdItem;
  assetFrom: AssetModel;
  assetTo: AssetModel;
}

const RECALCULATE_DELAY = 1000;

export const P2PSwapView = ({ ad, assetFrom, assetTo }: IProps) => {
  const t = useI18nContext();
  const navigate = useNavigate();
  const accountFrom = useAccount(assetFrom);
  const accountTo = useAccount(assetTo);
  const [nativeFrom, setNativeFrom] = useState<AssetModel>();
  const [nativeTo, setNativeTo] = useState<AssetModel>();
  const [paymentMethodShow, setPaymentMethodShow] = useState(false);
  const [loadingStartExchange, setLoadingStartExchange] = useState(false);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);
  const [incomingFee, setIncomingFee] = useState(0);

  const loadingCurrencies = !nativeTo && !nativeFrom;

  const [fromInput, setFromInput] = useState<AssetInputValue>({
    amount: '',
    recepientAddress: null,
    loading: false,
  });
  const [toInput, setToInput] = useState<AssetInputValue>({
    amount: '',
    recepientAddress: null,
    loading: false,
  });

  const balanceFrom = useAssetBalance(assetFrom);
  const balanceTo = useAssetBalance(assetTo);

  const from = {
    account: accountFrom,
    asset: assetFrom,
    input: fromInput,
    balance: balanceFrom,
  };
  const to = {
    account: accountTo,
    asset: assetTo,
    input: toInput,
    balance: balanceTo,
  };

  useEffect(() => {
    const from =
      assetFrom.isNative || assetFrom.isFiat
        ? assetFrom
        : getNative(assetFrom.network);
    const to =
      assetTo.isNative || assetTo.isFiat ? assetTo : getNative(assetTo.network);

    const toConvert = [];
    if (assetFrom === from) {
      setNativeFrom(assetFrom);
    } else {
      toConvert.push(from.symbol);
    }
    if (assetTo === to) {
      setNativeTo(assetTo);
    } else {
      toConvert.push(to.symbol);
    }

    if (toConvert.length) {
      fetchRates('USDT', toConvert).then((result) => {
        if (!from.priceInUsdt) {
          const rate = result.data.USDT[from.symbol];
          setNativeFrom({
            ...from,
            priceInUsdt: rate ? 1 / rate : undefined,
          });
        }
        if (!to.priceInUsdt) {
          const rate = result.data.USDT[to.symbol];
          setNativeTo({
            ...to,
            priceInUsdt: rate ? 1 / rate : undefined,
          });
        }
      });
    }
  }, [assetFrom, assetTo]);

  const { submitBtnError, disabledBtn } = useAdValidation({
    ad,
    from,
    to,
  });
  const { fee: outgoingFee } = useFee({
    asset: assetFrom,
    amount: fromInput.amount,
    from: accountFrom.address,
    to: ad.walletAddress,
  });

  // const [totalFee, setTotalFee] = useState<number | null>(null);
  const auth = useAuthP2P();
  const dispatch = useDispatch<AppDispatch>();
  const exchangeRate = ad.coinPair.price;
  const needPickupPaymentMethod = ad.toCoin.networkName === NetworkNames.fiat;

  const calcIncomingFee = useCallback(
    async (toAmount: number) => {
      if (ad.isAtomicSwap || !assetTo.chainId || nativeTo?.isFiat) {
        return 0;
      }
      let incomingFeeCalculated = 0;
      if (!nativeTo?.decimals) {
        throw new Error('calcIncomingFee - nativeTo must be contain decimals');
      }
      if (!nativeTo?.priceInUsdt) {
        throw new Error(
          'calcIncomingFee - nativeTo must be contain priceInUsdt',
        );
      }
      if (toAmount > 0 && nativeTo) {
        const txParams = generateTxParams({
          asset: assetTo,
          amount: toAmount,
          from: ad.walletAddressInNetwork2,
          to: toInput.recepientAddress || accountTo.address,
          isAtomicSwap: ad.isAtomicSwap,
        });
        if (assetTo.contract) {
          txParams.contractAddress = txParams.to;
          delete txParams.to;
        }
        const { data } = await P2PService.estimateFee({
          ...txParams,
          value: txParams.value ? Number(txParams.value) : undefined,
          network: assetTo.network,
        });
        incomingFeeCalculated = Number(
          formatUnits(BigInt(data), nativeTo.decimals),
        );

        if (!isEqual(nativeTo, assetTo)) {
          const normalizeRate = nativeTo.priceInUsdt / assetTo.priceInUsdt;
          incomingFeeCalculated *= normalizeRate;
        }
      }
      setIncomingFee(incomingFeeCalculated);
      return incomingFeeCalculated;
    },
    [nativeTo, nativeFrom],
  );

  const recalculateTo = useCallback(
    debounce(async (fromAmount) => {
      let sumInCoin2 = Number(fromAmount) * exchangeRate;
      if (sumInCoin2 > 0) {
        const fee = await calcIncomingFee(sumInCoin2);
        sumInCoin2 -= fee;
        setToInput((prevVal) => ({
          ...prevVal,
          amount: sumInCoin2 > 0 ? Number(sumInCoin2.toFixed(8)) : 0,
          loading: false,
        }));
      } else {
        setToInput((prevVal) => ({
          ...prevVal,
          amount: 0,
          loading: false,
        }));
      }
    }, RECALCULATE_DELAY),
    [calcIncomingFee],
  );

  const recalculateFrom = useCallback(
    debounce(async (toAmount) => {
      const sumInCoin2 = Number(toAmount);
      let sumInCoin1 = sumInCoin2 / exchangeRate;
      if (sumInCoin1 > 0) {
        const fee = await calcIncomingFee(sumInCoin2);
        sumInCoin1 += fee / exchangeRate;
        setFromInput({
          ...fromInput,
          amount: sumInCoin1 > 0 ? Number(sumInCoin1.toFixed(8)) : 0,
          loading: false,
        });
      } else {
        setFromInput({
          ...fromInput,
          amount: 0,
          loading: false,
        });
      }
    }, RECALCULATE_DELAY),
    [calcIncomingFee],
  );

  const updateFrom = (v: AssetInputValue) => {
    setFromInput(v);
    setToInput((prev) => ({ ...prev, loading: true }));
    recalculateTo(v.amount);
  };

  const updateTo = (v: AssetInputValue) => {
    setToInput(v);
    setFromInput((prev) => ({ ...prev, loading: true }));
    recalculateFrom(v.amount);
  };

  useEffect(() => {
    updateFrom({
      amount: fromTokenInputValue,
      recepientAddress: null,
      loading: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTokenInputValue]);

  const startExchange = async (paymentMethod?: UserPaymentMethod) => {
    try {
      setLoadingStartExchange(true);
      const result = await auth(() =>
        dispatch(
          createSwapP2P({
            from,
            to,
            exchange: ad,
            paymentMethod,
            slippage: 0.5,
          }),
        ),
      );

      navigate(`${AWAITING_SWAP_ROUTE}/${result.id}`);
    } catch (e) {
      setLoadingStartExchange(false);
      console.error(e);
      // show swap error popup
      throw new Error(e.message);
    }
  };

  const openPaymentMethodPicker = () => {
    setPaymentMethodShow(true);
  };

  return (
    <Box>
      {paymentMethodShow && (
        <PaymentMethodPicker
          currency={
            ad.fromCoin.networkName === NetworkNames.fiat
              ? ad.fromCoin.ticker
              : ad.toCoin.ticker
          }
          onSelect={(v) => {
            startExchange(v);
          }}
          onClose={() => {
            setPaymentMethodShow(false);
          }}
        />
      )}
      <Box marginBottom={2}>
        <Typography
          variant="body2"
          color="text.secondary"
          marginBottom={1}
          marginLeft={1}
        >
          {t('youGive')}
        </Typography>
        {assetFrom ? (
          <AssetAmountField
            asset={assetFrom}
            balance={balanceFrom}
            value={fromInput}
            disabled={loadingCurrencies}
            onChange={updateFrom}
          />
        ) : (
          <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <AssetItem iconSize={40} coin={ad.fromCoin} />
              <Box marginTop={2}>
                <Alert severity="warning">Unsupported asset</Alert>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
      <Box marginBottom={2}>
        <Typography
          variant="body2"
          color="text.secondary"
          marginBottom={1}
          marginLeft={1}
        >
          {t('youGet')}
        </Typography>
        {assetTo ? (
          <AssetAmountField
            asset={assetTo}
            balance={balanceTo}
            value={toInput}
            onChange={updateTo}
            disabled={loadingCurrencies}
            reserve={ad.reserveInCoin2}
          />
        ) : (
          <Card variant="outlined" sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <AssetItem iconSize={40} coin={ad.toCoin} />
              <Box marginTop={2}>
                <Alert severity="warning">Unsupported asset</Alert>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
      <Box padding={2}>
        <P2PSwapSummary exchange={ad} />
        <Box display="flex" justifyContent="space-between" marginTop={1}>
          <Box display="flex" alignItems="center">
            <Typography marginRight={1}>Slippage Tolerance</Typography>
            <ButtonIcon iconName="setting-dex" />
          </Box>
          <Typography fontWeight="bold">0.5%</Typography>
        </Box>
        {outgoingFee && outgoingFee > 0 && nativeFrom?.isNative && (
          <Box display="flex" justifyContent="space-between" marginTop={2}>
            <Typography>Outgoing transaction fee</Typography>
            <Box display="flex">
              <Typography>
                {formatFundsAmount(outgoingFee, nativeFrom.symbol)}
              </Typography>
              {nativeFrom.priceInUsdt && (
                <Typography color="text.secondary" marginLeft={1}>
                  {formatCurrency(outgoingFee * nativeFrom.priceInUsdt, 'usd')}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        {incomingFee > 0 && nativeTo?.isNative && (
          <Box display="flex" justifyContent="space-between" marginTop={2}>
            <Typography>Incoming transaction fee</Typography>
            <Box display="flex">
              <Typography>
                {formatFundsAmount(incomingFee, assetTo.symbol)}
              </Typography>
              {assetTo.priceInUsdt && (
                <Typography color="text.secondary" marginLeft={1}>
                  {formatCurrency(incomingFee * assetTo.priceInUsdt, 'usd')}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
      <Box marginTop={2}>
        <Button
          className={classNames({ 'btn-error': Boolean(submitBtnError) })}
          fullWidth
          disabled={loadingStartExchange || disabledBtn}
          variant="contained"
          size="large"
          onClick={
            needPickupPaymentMethod
              ? () => auth(openPaymentMethodPicker)
              : () => startExchange()
          }
        >
          {submitBtnError || 'Start swap'}
        </Button>
      </Box>
    </Box>
  );
};
