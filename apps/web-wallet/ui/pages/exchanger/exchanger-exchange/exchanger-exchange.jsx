import React, { useEffect, useRef, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { compact, isEqual } from 'lodash';
import { useI18nContext } from '../../../hooks/useI18nContext';

import PageContainer from '../../../components/ui/page-container';
import { EXCHANGER_ROUTE } from '../../../helpers/constants/routes';
import Box from '../../../components/ui/box/box';
import { DISPLAY } from '../../../helpers/constants/design-system';
import {
  p2pCommitReservesSettings,
  p2pRemoveReserveSetting,
} from '../../../store/actions';

import { getExchanger, getExchangerReserves } from '../../../selectors';
import { useTokensToSearch } from '../../../hooks/useTokensToSearch';

import { MINUTE } from '../../../../shared/constants/time';
import { ExchangerRateSources } from '../../../../shared/constants/exchanger';
import { getAssets } from '../../../ducks/metamask/metamask';
import { useAssets } from '../../../hooks/useAssets';
import { useFiats } from '../../../hooks/useFiats';
import ExchangeForm from './exchange-form';

const ExchangerExchange = () => {
  const t = useI18nContext();
  const history = useHistory();
  const dispatch = useDispatch();
  const { id: exchangeId } = useParams();

  const pageContainerRef = useRef();
  const [submitText, setSubmitText] = useState(t('save'));
  const [disabledSave, setDisabledSave] = useState(false);
  const [form, setForm] = useState({
    currencyAggregator: {
      value: ExchangerRateSources.binance,
      flipped: true,
    },
    reserve: null,
  });
  const [errors, setErros] = useState({});

  const exchanger = useSelector(getExchanger, isEqual);
  const reserves = useSelector(getExchangerReserves, isEqual);

  const usersTokens = useSelector(getAssets);
  const fiats = useFiats();
  const { all: allAssets, findToken } = useAssets({ includeFiats: true });

  const allTokens = useTokensToSearch({
    usersTokens,
    shuffledTokensList: allAssets,
    excludesList: compact([form.toAsset]),
    renderableOutputFormat: false,
  });

  const allReserves = useTokensToSearch({
    usersTokens: [...reserves.map(({ asset }) => asset), ...fiats],
    hideZeroBalances: true,
    excludesList: compact([form.fromAsset]),
    renderableOutputFormat: false,
  });

  useEffect(() => {
    const currentExchange = exchanger.exchangerSettings?.find(
      ({ id }) => Number(id) === Number(exchangeId),
    );
    if (currentExchange) {
      const {
        id,
        from,
        to,
        priceAdjustment,
        minimumExchangeAmountCoin1,
        transactionFee,
        paymentMethod,
        coinPair,
        reserveLimitation,
        timeToPay,
        exchangersPolicy,
        reserve,
      } = currentExchange;
      const fromAsset = findToken(from.ticker, from.networkName);
      const toAsset = findToken(to.ticker, to.networkName);

      setForm({
        exchangersPolicy,
        isAtomicSwap: currentExchange.isAtomicSwap,
        currencyAggregator: {
          coinPairId: coinPair.id,
          flipped: coinPair.flipped,
          price: coinPair.originalPrice,
          value: coinPair.currencyAggregator,
          priceAdjustment,
        },
        id,
        reserve: reserve.reserve,
        timeToPay: timeToPay / MINUTE,
        reserveLimitation,
        minAmount: minimumExchangeAmountCoin1,
        transactionFee,
        paymentMethod,
        fromAsset,
        toAsset,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeId]);

  const [error] = Object.values(errors);

  return (
    <PageContainer
      ref={pageContainerRef}
      className="exchanger-exchange"
      title={t('exchange')}
      subtitle={t('exchangerReservesSettings')}
      disabled={error || disabledSave}
      hideFooter={false}
      subtitleContent={
        <>
          <Box display={DISPLAY.FLEX}>
            <span className="flex-grow">
              {exchangeId ? 'Exchange preferencies' : 'Create new exchange'}
            </span>
          </Box>
        </>
      }
      onSubmit={async () => {
        setDisabledSave(true);
        setSubmitText(t('saving'));

        let saveError;
        const availableBalance =
          form.toAsset?.reserve || form.paymentMethod?.balance;
        const reserve = {
          coin: form.toAsset.getCoin(),
          reserve: availableBalance,
        };
        try {
          const data = {
            id: form.id,
            isAtomicSwap: form.isAtomicSwap,
            active: true,
            isVerifiedByUser: true,
            priceAdjustment: form.currencyAggregator.priceAdjustment || 0,
            transactionFee: form.transactionFee || null,
            reserveLimitation: form.reserveLimitation || null,
            minimumExchangeAmountCoin2: form.minAmount || 0,
            timeToPay: form.timeToPay ? form.timeToPay * MINUTE : undefined,
            exchangersPolicy: form.exchangersPolicy,
            coinPair: {
              id: form.currencyAggregator.coinPairId,
              currencyAggregator: form.currencyAggregator.value,
              nameFrom: form.fromAsset.symbol,
              nameTo: form.toAsset.symbol,
              flipped: form.currencyAggregator.flipped,
              pair: form.fromAsset.symbol + form.toAsset.symbol,
              price: form.currencyAggregator.price,
            },
            from: form.fromAsset.getCoin(),
            paymentMethod: form.paymentMethod,
            reserve,
            to: form.toAsset.getCoin(),
            walletAddress: form.fromAsset.isFiat
              ? ''
              : form.fromAsset.getAccount(),
            walletAddressInNetwork2: form.toAsset.isFiat
              ? ''
              : form.toAsset.getAccount(),
          };
          await dispatch(p2pCommitReservesSettings(data));
          setSubmitText(t('saved'));
        } catch (e) {
          setSubmitText(t('error'));
          saveError = e;
        }
        setDisabledSave(false);

        setTimeout(() => {
          setSubmitText(t('save'));
        }, 3000);

        if (!saveError) {
          history.push(EXCHANGER_ROUTE);
        }
      }}
      submitText={submitText}
      onCancel={() => {
        history.push(EXCHANGER_ROUTE);
      }}
      onClose={() => {
        history.push(EXCHANGER_ROUTE);
      }}
      contentComponent={
        <Box>
          <ExchangeForm
            value={form}
            allTokens={allTokens}
            allReserves={allReserves}
            errors={errors}
            setErros={setErros}
            onChange={(update) => {
              setForm((oldForm) => ({ ...oldForm, ...update }));
            }}
            onDelete={async ({ id }) => {
              await dispatch(p2pRemoveReserveSetting(id));
            }}
          />
        </Box>
      }
    />
  );
};

export default ExchangerExchange;
