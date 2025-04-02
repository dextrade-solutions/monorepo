import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import {
  formatFundsAmount,
  getAdLimitPerExchange,
  NetworkNames,
  NetworkTypes,
} from 'dex-helpers';
import { AdItem, AssetModel, UserPaymentMethod } from 'dex-helpers/types';
import { bgPrimaryGradient, ButtonIcon, useGlobalModalContext } from 'dex-ui';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { formatUnits } from 'viem';

import { NULLISH_TOKEN_ADDRESS } from '../../../../app/helpers/atomic-swaps';
import { generateTxParams } from '../../../../app/helpers/transactions';
import P2PService from '../../../../app/services/p2p-service';
import {
  createSwapP2P,
  getFromTokenInputValue,
} from '../../../ducks/swaps/swaps';
import { AWAITING_SWAP_ROUTE } from '../../../helpers/constants/routes';
import { useAssetInput } from '../../../hooks/asset/useAssetInput';
import { useAdValidation } from '../../../hooks/useAdValidation';
import { useAuthP2P } from '../../../hooks/useAuthP2P';
import { useFee } from '../../../hooks/useFee';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { AppDispatch } from '../../../store/store';
import AssetAmountField from '../../ui/asset-amount-field';
import P2PSwapSummary from '../p2p-swap-summary';
import { SwapFees } from './swap-fees';
import './index.scss';
import { getMaxOutputDecimalPlaces } from '../../../../app/helpers/p2p';

interface IProps {
  ad: AdItem;
  assetFrom: AssetModel;
  assetTo: AssetModel;
}

const RECALCULATE_DELAY = 1000;

export const P2PSwapView = ({ ad, assetFrom, assetTo }: IProps) => {
  const { showModal } = useGlobalModalContext();
  const t = useI18nContext();
  const navigate = useNavigate();
  const [slippage, setSlippage] = useState(0.5);
  const [loadingStartExchange, setLoadingStartExchange] = useState(false);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);
  const [incomingFee, setIncomingFee] = useState(ad.transactionFee);

  const { login } = useAuthP2P();
  const dispatch = useDispatch<AppDispatch>();

  const assetInputFrom = useAssetInput({
    asset: assetFrom,
  });
  const assetInputTo = useAssetInput({
    asset: assetTo,
    isToAsset: true,
  });
  const exchangeRate = ad.coinPair.price;
  const availablePaymentMethods = ad.paymentMethods;
  const needPickupExchangerPaymentMethod = assetInputFrom.asset.isFiat;
  const needPickupClientPaymentMethod =
    assetInputTo.asset.isFiat && !assetInputTo.paymentMethod;
  const needPickupRecipientAddress =
    !assetInputTo.asset.isFiat && !assetInputTo.account?.address;

  const calcIncomingFee = useCallback(
    async (toAmount: number) => {
      const { native, account } = assetInputTo;
      if (
        ad.isAtomicSwap ||
        !native?.chainId ||
        ad.transactionFee !== undefined
      ) {
        return ad.transactionFee || 0;
      }

      let incomingFeeCalculated = 0;
      if (!native) {
        throw new Error('calcIncomingFee - no native asset');
      }
      if (native) {
        const txParams = generateTxParams({
          asset: assetTo,
          amount: toAmount.toFixed(8),
          from: ad.walletAddressInNetwork2,
          to: account?.address || NULLISH_TOKEN_ADDRESS,
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
  const recalculateTo = useDebouncedCallback(async (fromAmount) => {
    let sumInCoin2 = Number(fromAmount) * exchangeRate;
    const feeInCoin2 = await calcIncomingFee(sumInCoin2);
    sumInCoin2 -= feeInCoin2;
    assetInputTo.setInputAmount(
      sumInCoin2 > 0
        ? formatFundsAmount(
            sumInCoin2,
            undefined,
            getMaxOutputDecimalPlaces(assetTo),
          )
        : 0,
    );
    assetInputTo.setLoading(false);
  }, RECALCULATE_DELAY);

  const recalculateFrom = useDebouncedCallback(async (toAmount) => {
    const sumInCoin2 = Number(toAmount);
    let sumInCoin1 = sumInCoin2 / exchangeRate;
    const feeInCoin2 = await calcIncomingFee(sumInCoin2);
    const feeInCoin1 = feeInCoin2 / exchangeRate;
    sumInCoin1 += feeInCoin1;
    assetInputFrom.setInputAmount(
      sumInCoin1 > 0
        ? formatFundsAmount(
            sumInCoin1,
            undefined,
            getMaxOutputDecimalPlaces(assetFrom),
          )
        : 0,
    );
    assetInputFrom.setLoading(false);
  }, RECALCULATE_DELAY);

  const { fee: outgoingFee, loading: outgoingFeeLoading } = useFee({
    asset: assetFrom,
    amount: assetInputFrom.value,
    from: assetInputFrom.account?.address,
    to: ad.walletAddress,
  });

  const insufficientNativeFee =
    outgoingFee && Number(assetInputFrom.balanceNative?.value) < outgoingFee;

  const { submitBtnText, hasValidationErrors, disabledBtn } = useAdValidation({
    ad,
    assetInputFrom,
    assetInputTo,
    outgoingFee,
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
    onInputAmountFrom(fromTokenInputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startExchange = async ({
    exchangerPaymentMethodId,
  }: {
    exchangerPaymentMethodId?: number;
  } = {}) => {
    try {
      setLoadingStartExchange(true);
      const result = await login({
        onSuccess: (on401?: () => void) =>
          dispatch(
            createSwapP2P({
              from: assetInputFrom,
              to: assetInputTo,
              exchange: ad,
              slippage,
              exchangerPaymentMethodId,
              on401,
            }),
          ),
      });

      navigate(`${AWAITING_SWAP_ROUTE}/${result.data.id}`);
    } catch (e) {
      setLoadingStartExchange(false);
      showModal({
        name: 'ALERT_MODAL',
        severity: 'error',
        text: e.message,
      });
    }
  };

  const pickupExchangerPaymentMethod = () => {
    showModal({
      name: 'ITEM_PICKER',
      options: availablePaymentMethods,
      title: t('choosePaymentMethod'), // i18n added here
      getOptionLabel: (paymentMethod: UserPaymentMethod) =>
        paymentMethod.paymentMethod.name,
      getOptionKey: (paymentMethod: UserPaymentMethod) =>
        paymentMethod.userPaymentMethodId,
      onSelect: (v: number) => startExchange({ exchangerPaymentMethodId: v }),
    });
  };

  return (
    <Box>
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
          assetInput={assetInputFrom}
          hasValidationErrors={hasValidationErrors}
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
          assetInput={assetInputTo}
          hasValidationErrors={hasValidationErrors}
          reserve={getAdLimitPerExchange(ad)}
          onChange={onInputAmountTo}
        />
      </Box>
      <Box
        sx={{
          px: { xs: 1, lg: 2 },
        }}
        pt={1}
        pb={2}
      >
        <P2PSwapSummary exchange={ad} />
        {!assetFrom.isFiat && !assetTo.isFiat && (
          <Box display="flex" justifyContent="space-between" marginTop={1}>
            <Box display="flex" alignItems="center">
              <Typography marginRight={1}>{t('slippageTolerance')}</Typography>
            </Box>
            <Typography fontWeight="bold">
              {slippage}%{' '}
              <ButtonIcon
                iconProps={{
                  color: 'text.primary',
                }}
                onClick={() =>
                  showModal({
                    name: 'SLIPPAGE_MODAL',
                    value: slippage,
                    onChange: (v: number) => setSlippage(v),
                  })
                }
                iconName="setting-dex"
              />
            </Typography>
          </Box>
        )}
        <Box mt={2}>
          <SwapFees
            superFee={assetFrom.standard === NetworkTypes.trc20}
            loading={
              assetInputTo.loading ||
              assetInputFrom.loading ||
              outgoingFeeLoading
            }
            inbound={{
              amount: incomingFee,
              asset: assetTo,
            }}
            outbound={{ amount: outgoingFee, asset: assetInputFrom.native }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          position: 'sticky',
          bottom: '10px',
          zIndex: 2,
          overflow: 'unset !important',
        }}
        marginTop={1}
      >
        {assetInputFrom.asset.network === NetworkNames.tron &&
          assetInputFrom.account && (
            <Button
              fullWidth
              onClick={() => {
                P2PService.requestEnergy(assetInputFrom.account.address);
              }}
            >
              {t('requestEnergy')} {/* i18n added here */}
            </Button>
          )}
        <Button
          className={classNames({ 'btn-error': hasValidationErrors })}
          fullWidth
          sx={{
            backgroundImage:
              loadingStartExchange || disabledBtn
                ? undefined
                : bgPrimaryGradient,
          }}
          disabled={loadingStartExchange || disabledBtn}
          variant="contained"
          size="large"
          onClick={() => {
            // return assetInputFrom.makeTransfer(ad.walletAddress);
            if (needPickupClientPaymentMethod) {
              return assetInputTo.showPaymentMethod();
            } else if (needPickupExchangerPaymentMethod) {
              return pickupExchangerPaymentMethod();
            } else if (needPickupRecipientAddress) {
              return assetInputTo.showConfigureWallet();
            } else if (insufficientNativeFee) {
              return assetInputFrom.showDeposit({
                awaitingDepositAmount: outgoingFee,
                onSuccess: () => startExchange(),
              });
            }
            return startExchange();
          }}
        >
          {submitBtnText}
        </Button>
      </Box>
    </Box>
  );
};
