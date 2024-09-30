import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { debounce } from 'lodash';
import { I18nContext } from '../../../contexts/i18n';
import {
  getFromTokenInputValue,
  signAndSendTransactions,
} from '../../../ducks/swaps/swaps';
import SwapsFooter from '../swaps-footer/swaps-footer';
import AssetInputCard from '../../../components/ui/asset-input-card';
import {
  AlignItems,
  BorderRadius,
  Color,
  DISPLAY,
  SEVERITIES,
  Size,
  TextColor,
  TextWhiteSpace,
} from '../../../helpers/constants/design-system';
import {
  BannerAlert,
  ICON_NAMES,
  Icon,
  Text,
} from '../../../components/component-library';
import Box from '../../../components/ui/box/box';
import { emulateTransaction } from '../../../store/actions';
import { SECOND } from '../../../../shared/constants/time';
import Alert from '../../../components/ui/alert';
import Asset from '../../../components/ui/asset';
import { humanizePaymentMethodName } from '../../../../shared/lib/payment-methods-utils';
import { useAsset } from '../../../hooks/useAsset';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import UserPreferencedCurrencyDisplay from '../../../components/app/user-preferenced-currency-display';
import { formatLongAmount } from '../../../../shared/lib/ui-utils';
import { RatingOutput } from '../../../components/app/rating-output';

const RECALCULATE_DELAY = SECOND;

export default function P2PExchange({
  exchange,
  toAsset: initialToAsset,
  fromAsset: inititalFromAsset,
}) {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const history = useHistory();

  const fromInputValue = useSelector(getFromTokenInputValue);

  const { fromCoin, toCoin } = exchange;
  const toAsset = useAsset(initialToAsset.value);
  const fromAsset = useAsset(inititalFromAsset.value);

  const isSupportedPair = toAsset && fromAsset;

  const [fromInput, setFromInput] = useState({
    amount: fromInputValue && parseFloat(fromInputValue || 0),
    asset: fromAsset,
    loading: false,
    touched: false,
  });
  const [toInput, setToInput] = useState({
    amount: '',
    asset: toAsset,
    loading: false,
    touched: false,
  });
  const [estimateFeeFrom, setEstimateFeeFrom] = useState(null);
  const [totalFee, setTotalFee] = useState(null);
  const [errors, setErrors] = useState({
    from: null,
    to: null,
  });

  const exchangeRate = exchange.coinPair.price;

  const refreshFeeFromTransaction = useCallback(
    async (amount) => {
      if (exchange?.walletAddress && fromAsset && amount > 0) {
        const result = await dispatch(
          emulateTransaction({
            sendToken: {
              ...fromAsset,
            },
            amount,
            destinationAddress: exchange.walletAddress,
          }),
        );
        setEstimateFeeFrom(result);
      }
    },
    [exchange, fromAsset, dispatch],
  );

  const refreshFeeToTransaction = useCallback(
    async (amount) => {
      let fee = exchange.transactionFee || 0;
      if (exchange?.walletAddressInNetwork2 && toAsset && amount > 0) {
        setErrors({
          ...errors,
          feeToTransaction: null,
        });
        try {
          const result = await dispatch(
            emulateTransaction({
              sendToken: {
                ...toAsset,
                account: exchange.walletAddressInNetwork2,
              },
              amount,
              destinationAddress: toAsset.getAccount(),
            }),
          );
          fee += result.feeNormalized || 0;
        } catch {
          setErrors({
            ...errors,
            feeToTransaction: 'Failed load fee for exchanger',
          });
        }
      }
      setTotalFee(fee);
      return fee;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exchange, toAsset, dispatch],
  );

  const recalculateTo = useCallback(
    debounce(async (fromAmount) => {
      refreshFeeFromTransaction(fromAmount);
      let sumInCoin2 = Number(fromAmount) * exchangeRate;
      const fee = await refreshFeeToTransaction(sumInCoin2);
      sumInCoin2 -= fee;
      if (sumInCoin2 > 0) {
        setToInput({
          ...toInput,
          amount: Number(sumInCoin2.toFixed(8)),
          loading: false,
        });
      } else {
        setToInput({
          ...toInput,
          amount: 0,
          loading: false,
        });
      }
    }, RECALCULATE_DELAY),
    [],
  );

  const recalculateFrom = useCallback(
    debounce(async (toAmount) => {
      let sumInCoin2 = Number(toAmount);
      const fee = await refreshFeeToTransaction(sumInCoin2);
      sumInCoin2 += fee;
      const sumInCoin1 = sumInCoin2 / exchangeRate;
      if (sumInCoin1 > 0) {
        refreshFeeFromTransaction(sumInCoin1);
        setFromInput({
          ...fromInput,
          amount: Number(sumInCoin1.toFixed(8)),
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
    [],
  );

  const onChangeTo = useCallback(
    async (toValue) => {
      setToInput({ ...toValue, touched: true });
      setFromInput({ ...fromInput, loading: true });
      recalculateFrom(toValue.amount);
    },
    [fromInput, recalculateFrom],
  );

  const onChangeFrom = useCallback(
    async (fromValue) => {
      setFromInput({ ...fromValue, touched: true });
      setToInput({ ...toInput, loading: true });
      recalculateTo(fromValue.amount);
    },
    [toInput, recalculateTo],
  );

  const makeTransaction = () => {
    dispatch(
      signAndSendTransactions(history, { fromInput, toInput, exchange }),
    );
  };

  const validate = (key, err) => {
    const newErrors = Object.assign(errors, { [key]: err });
    if (toInput.asset?.isFiat && !toInput.paymentMethod) {
      newErrors.paymentMethod = 'No payment method';
    } else {
      newErrors.paymentMethod = null;
    }
    setErrors(newErrors);
  };

  const errorOutput = Object.values(errors).find((i) => Boolean(i));

  const renderFeeFrom = () => {
    return (
      <Box display={DISPLAY.FLEX}>
        <Text marginTop={1} className="flex-grow">
          Estimated fee
        </Text>
        <Box>
          <UserPreferencedCurrencyDisplay
            value={estimateFeeFrom.hexFee}
            type={PRIMARY}
            ticker={fromAsset.sharedProvider.nativeToken.symbol}
            shiftBy={fromAsset.sharedProvider.nativeToken.decimals}
          />
          <UserPreferencedCurrencyDisplay
            value={estimateFeeFrom.hexFee}
            type={SECONDARY}
            ticker={fromAsset.sharedProvider.nativeToken.symbol}
            shiftBy={fromAsset.sharedProvider.nativeToken.decimals}
          />
        </Box>
      </Box>
    );
  };

  return (
    <>
      <div className="p2p-exchange">
        <div className="p2p-exchange__content">
          <div className="p2p-exchange__row">
            <Text className="row-label" color={Color.textMuted}>
              You give
            </Text>
            {fromAsset ? (
              <AssetInputCard
                value={fromInput}
                asset={fromAsset}
                readonlyCoin
                hidePaymentMethods
                onChange={onChangeFrom}
                validate={(v) => validate('fromToken', v)}
                reserve={exchange.reserveInCoin2 / exchangeRate}
                renderFooter={estimateFeeFrom && renderFeeFrom}
              />
            ) : (
              <Box padding={2} className="coin-input-card">
                <Asset asset={inititalFromAsset.coin} isCoin />
                <Text color={TextColor.warningDefault} marginTop={1}>
                  This coin is not supported in your wallet
                </Text>
              </Box>
            )}
          </div>
          <div className="p2p-exchange__row">
            <Text className="row-label" color={Color.textMuted}>
              You get
            </Text>
            {toAsset ? (
              <AssetInputCard
                value={toInput}
                asset={toAsset}
                readonlyCoin
                onChange={onChangeTo}
                validate={(v) => validate('toToken', v)}
                reserve={exchange.reserveInCoin2}
                isReserveToken
                renderFooter={
                  errors.feeToTransaction &&
                  (() => (
                    <BannerAlert severity={SEVERITIES.DANGER}>
                      {errors.feeToTransaction}
                    </BannerAlert>
                  ))
                }
              />
            ) : (
              <Box padding={2} className="coin-input-card">
                <Asset asset={initialToAsset.coin} isCoin />
                <Text color={TextColor.warningDefault} marginTop={1}>
                  This coin is not supported in your wallet
                </Text>
              </Box>
            )}
          </div>
          <div className="p2p-exchange__row">
            <div className="row-summary">
              <Text display={DISPLAY.FLEX}>
                <strong className="flex-grow">{t('provider')}</strong>
                <strong className="row-summary__value">{exchange.name}</strong>
              </Text>
              <Text display={DISPLAY.FLEX}>
                <strong className="flex-grow">{t('status')}</strong>
                <strong className="row-summary__value">
                  {exchange.isExchangerActive ? t('online') : t('offline')}
                </strong>
              </Text>
              <Text display={DISPLAY.FLEX} marginBottom={4}>
                <strong className="flex-grow">{t('rating')}</strong>
                <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
                  <strong>
                    <RatingOutput
                      exchangeCount={exchange.exchangeCount}
                      exchangeCompletionRate={exchange.exchangeCompletionRate}
                      {...exchange.rating}
                    />
                  </strong>
                </Box>
              </Text>
              <Text display={DISPLAY.FLEX}>
                <span className="flex-grow">{fromCoin.ticker}</span>
                <span className="row-summary__value">
                  {formatLongAmount(exchange.priceInCoin2, toCoin.ticker)}
                </span>
              </Text>
              <Text display={DISPLAY.FLEX}>
                <span className="flex-grow">{t('reserve')}</span>
                <span className="row-summary__value">
                  {formatLongAmount(exchange.reserveInCoin2, toCoin.ticker)}
                </span>
              </Text>
              {exchange.minimumExchangeAmountCoin1 > 0 && (
                <Text display={DISPLAY.FLEX}>
                  <span className="flex-grow">{t('min')}</span>
                  <span className="row-summary__value">
                    {formatLongAmount(
                      exchange.minimumExchangeAmountCoin1,
                      fromCoin.ticker,
                    )}
                  </span>
                </Text>
              )}
              {/* Should we display user exchangerFee?
               {exchangerFeeCalulated > 0 && (
                <Text display={DISPLAY.FLEX}>
                  <span className="flex-grow">{t('exchangerFee')}</span>
                  <span className="row-summary__value">
                    {exchangerFeeCalulated.toFixed(6)} {fromCoin.ticker}
                  </span>
                </Text>
              )} */}
              {totalFee > 0 && (
                <Text display={DISPLAY.FLEX}>
                  <span className="flex-grow">{t('transactionFee')}</span>
                  <span className="row-summary__value">
                    ~{' '}
                    {formatLongAmount(totalFee / exchangeRate, fromCoin.ticker)}
                  </span>
                </Text>
              )}
              {exchange.paymentMethod && (
                <Text display={DISPLAY.FLEX} marginTop={4}>
                  <span className="flex-grow">Payment method</span>
                  <span className="row-summary__value">
                    {humanizePaymentMethodName(
                      exchange.paymentMethod.paymentMethod.name,
                      t,
                    )}
                  </span>
                </Text>
              )}
            </div>
            {exchange.exchangersPolicy && (
              <Box
                backgroundColor={Color.backgroundDefault}
                padding={4}
                marginTop={2}
                borderRadius={BorderRadius.XL}
                borderWidth={1}
                borderColor={Color.infoMuted}
              >
                <Alert
                  visible
                  msg="Please read the exchanger's terms and conditions before placing an order. Failure to do so may result in a failed transaction and financial losses."
                  marginBottom={4}
                />
                <Text whiteSpace={TextWhiteSpace.preWrap}>
                  {exchange.exchangersPolicy}
                </Text>
              </Box>
            )}
          </div>
        </div>
        <SwapsFooter
          onSubmit={makeTransaction}
          submitText={
            isSupportedPair ? errorOutput || t('confirm') : 'Unsupported pair'
          }
          disabled={
            !isSupportedPair ||
            errorOutput ||
            !fromInput.amount ||
            fromInput.loading ||
            toInput.loading
          }
          hideCancel
          showTermsOfService
        />
      </div>
    </>
  );
}

P2PExchange.propTypes = {
  exchange: PropTypes.object,
  toAsset: PropTypes.object,
  fromAsset: PropTypes.object,
};
