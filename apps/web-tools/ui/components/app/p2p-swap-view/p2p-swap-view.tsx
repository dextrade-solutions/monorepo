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
import { useAssetInput } from '../../../hooks/asset/useAssetInput';

interface IProps {
  ad: AdItem;
  assetFrom: AssetModel;
  assetTo: AssetModel;
}

const RECALCULATE_DELAY = 1000;

export const P2PSwapView = ({ ad, assetFrom, assetTo }: IProps) => {
  const t = useI18nContext();
  const navigate = useNavigate();
  const [paymentMethodShow, setPaymentMethodShow] = useState(false);
  const [loadingStartExchange, setLoadingStartExchange] = useState(false);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);
  const [incomingFee, setIncomingFee] = useState(0);
  const [amountsWithFee, setAmountsWithFee] = useState();
  const [fromAmountWithFee, setFromAmountWithFee] = useState('');
  const [toAmountWithFee, setToAmountWithFee] = useState('');

  // const [fromInputAmountWithFee, setFromInputAmountWithFee] = useState(0);
  // const [toInputAmountWithFee, setToInputAmountWithFee] = useState(0);

  const auth = useAuthP2P();
  const dispatch = useDispatch<AppDispatch>();
  const exchangeRate = ad.coinPair.price;
  const needPickupPaymentMethod = ad.toCoin.networkName === NetworkNames.fiat;

  const assetInputFrom = useAssetInput({
    asset: assetFrom,
    exchangeRate,
  });
  const assetInputTo = useAssetInput({
    asset: assetTo,
    exchangeRate: 1 / exchangeRate,
    reserve: ad.reserveInCoin2,
  });

  const calcIncomingFee = useCallback(
    async (toAmount: number) => {
      const { native, account } = assetInputTo;
      if (ad.isAtomicSwap || ad.provider || !native?.chainId) {
        return 0;
      }
      let incomingFeeCalculated = 0;
      if (!native) {
        throw new Error('calcIncomingFee - no native asset');
      }
      if (toAmount > 0 && native) {
        const txParams = generateTxParams({
          asset: assetTo,
          amount: toAmount.toFixed(8),
          from: ad.walletAddressInNetwork2,
          to: account.address,
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
          formatUnits(BigInt(data), native.decimals),
        );

        if (!isEqual(native, assetTo)) {
          const normalizeRate = native.priceInUsdt / assetTo.priceInUsdt;
          incomingFeeCalculated *= normalizeRate;
        }
      }
      setIncomingFee(incomingFeeCalculated);
      return incomingFeeCalculated;
    },
    [assetInputTo, assetTo, ad],
  );
  const recalculateTo = useCallback(
    debounce(async (fromAmount) => {
      let sumInCoin2 = Number(fromAmount) * exchangeRate;
      if (sumInCoin2 > 0) {
        const fee = await calcIncomingFee(sumInCoin2);
        sumInCoin2 -= fee;
        assetInputTo.setInputAmount(
          sumInCoin2 > 0 ? Number(sumInCoin2.toFixed(8)) : 0,
        );
      } else {
        assetInputTo.setInputAmount(0);
      }
      assetInputTo.setLoading(false);
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
        assetInputFrom.setInputAmount(
          sumInCoin1 > 0 ? Number(sumInCoin1.toFixed(8)) : 0,
        );
      } else {
        assetInputFrom.setInputAmount(0);
      }
      assetInputFrom.setLoading(false);
    }, RECALCULATE_DELAY),
    [calcIncomingFee],
  );

  const { submitBtnError, disabledBtn } = useAdValidation({
    ad,
    assetInputFrom,
    assetInputTo,
  });
  const { fee: outgoingFee } = useFee({
    asset: assetFrom,
    amount: assetInputFrom.amount,
    from: assetInputFrom.account.address,
    to: ad.walletAddress,
  });

  const onInputAmountFrom = (v) => {
    assetInputFrom.setInputAmount(v);

    assetInputTo.setLoading(true);
    recalculateTo(v);
  };

  const onInputAmountTo = (v) => {
    assetInputTo.setInputAmount(v);

    assetInputFrom.setLoading(true);
    recalculateFrom(v);
  };

  useEffect(() => {
    assetInputFrom.setInputAmount(fromTokenInputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTokenInputValue]);

  const startExchange = async (paymentMethod?: UserPaymentMethod) => {
    try {
      setLoadingStartExchange(true);
      const result = await auth(() =>
        dispatch(
          createSwapP2P({
            from: assetInputFrom,
            to: assetInputTo,
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
        <AssetAmountField
          asset={assetInputFrom.asset}
          balance={assetInputFrom.balance}
          amount={assetInputFrom.amount}
          disabled={assetInputFrom.loading}
          onChange={onInputAmountFrom}
        />
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
        <AssetAmountField
          asset={assetInputTo.asset}
          balance={assetInputTo.balance}
          amount={assetInputTo.amount}
          disabled={assetInputTo.loading}
          reserve={ad.reserveInCoin2}
          onChange={onInputAmountTo}
        />
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
        {Boolean(outgoingFee && outgoingFee > 0 && assetInputFrom.native) && (
          <Box display="flex" justifyContent="space-between" marginTop={2}>
            <Typography>Outgoing transaction fee</Typography>
            <Box display="flex">
              <Typography>
                {formatFundsAmount(outgoingFee, assetInputFrom.native.symbol)}
              </Typography>
              {assetInputFrom.native.priceInUsdt && (
                <Typography color="text.secondary" marginLeft={1}>
                  {formatCurrency(
                    outgoingFee * assetInputFrom.native.priceInUsdt,
                    'usd',
                  )}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        {incomingFee > 0 && assetInputFrom.native && (
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
