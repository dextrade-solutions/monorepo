import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { InputAdornment } from '@mui/material';
import classnames from 'classnames';
import { useDispatch } from 'react-redux';
import Box from '../../../components/ui/box';
import TextField from '../../../components/ui/text-field';

import {
  AlignItems,
  BLOCK_SIZES,
  Color,
  DISPLAY,
  FLEX_DIRECTION,
  IconColor,
  JustifyContent,
  OVERFLOW_WRAP,
  Size,
  TEXT_ALIGN,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import {
  Button,
  ICON_NAMES,
  ICON_SIZES,
  Icon,
  Text,
} from '../../../components/component-library';
import ExchangerRateSourcePicker from '../../../components/app/modals/exchanger-rate-source-picker';
import {
  ExchangerRateSources,
  RATE_SOURCES_META,
} from '../../../../shared/constants/exchanger';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { formatLongAmount } from '../../../../shared/lib/ui-utils';
import { dextradeRequest } from '../../../store/actions';
import LoadingSkeleton from '../../../components/ui/loading-skeleton';
import { NumericField } from '../../../components/component-library/numeric-field';

export default function ExchangeRateField({
  currencyAggregator = {},
  fromAsset,
  toAsset,
  onChange,
}) {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const [showExchangerRatePicker, setShowExchangeRatePicker] = useState(false);
  const [availableAggregators, setAvailableAggregators] = useState([]);
  const [lowestPrice, setLowestPrice] = useState(null);

  const price = parseFloat(currencyAggregator.price || 0);
  const originalRate = currencyAggregator.flipped
    ? currencyAggregator.price && price
    : currencyAggregator.price && Number((1 / price).toPrecision(15));

  const percent =
    originalRate * ((currencyAggregator.priceAdjustment || 0) / 100);
  const rate = currencyAggregator.flipped
    ? originalRate - percent
    : originalRate + percent;

  const showLoadingSkeleton = !currencyAggregator && currencyAggregator.loading;
  const showPriceLoading = currencyAggregator && currencyAggregator.loading;

  const setLoading = (loading) => {
    onChange({
      ...currencyAggregator,
      loading,
    });
  };

  const setPriceAdjustment = (val) => {
    onChange({
      ...currencyAggregator,
      priceAdjustment: val,
    });
  };

  const filpCurrency = () => {
    onChange({
      ...currencyAggregator,
      flipped: !currencyAggregator.flipped,
    });
  };

  useEffect(() => {
    if (fromAsset && toAsset && !currencyAggregator.loading) {
      setLoading(true);
      dispatch(
        dextradeRequest({
          url: 'api/coin-pairs/currencies/by/pair',
          params: {
            nameFrom: fromAsset,
            nameTo: toAsset,
          },
          showLoading: false,
        }),
      ).then(({ aggregators, lowestPrice: lowest }) => {
        let {
          coinPairId,
          price: currentPrice,
          value: currentValue,
        } = currencyAggregator;

        setAvailableAggregators(aggregators);
        setLowestPrice(lowest);

        aggregators.forEach((item) => {
          // set binance by default if it exists
          if (item.currencyAggregator === ExchangerRateSources.binance) {
            currentValue = ExchangerRateSources.binance;
          }
          if (item.currencyAggregator === currentValue) {
            currentPrice = item.price || currentPrice;
            coinPairId = item.id || coinPairId;
          }
        });
        if (!currentValue) {
          currentValue = ExchangerRateSources.fixedPrice;
        }
        onChange({
          ...currencyAggregator,
          value: currentValue,
          price: currentPrice,
          coinPairId,
          loading: false,
        });
      });
    }
  }, [fromAsset, toAsset, dispatch]);

  return (
    <Box className="exchange-rate-field">
      {showExchangerRatePicker && (
        <ExchangerRateSourcePicker
          value={currencyAggregator.value}
          availableAggregators={availableAggregators}
          onSelect={(item) => {
            onChange({
              coinPairId: item.id,
              flipped: currencyAggregator.flipped,
              value: item.currencyAggregator,
              price: item.price,
            });
          }}
          onClose={() => {
            setShowExchangeRatePicker(false);
          }}
        />
      )}
      <LoadingSkeleton isLoading={showLoadingSkeleton}>
        <Box
          marginLeft={3}
          className={classnames({
            'exchange-rate-field__rate': true,
            reversed: currencyAggregator.flipped,
          })}
          display={DISPLAY.FLEX}
          flexDirection={FLEX_DIRECTION.COLUMN}
          alignItems={JustifyContent.center}
        >
          <Box
            width={BLOCK_SIZES.FULL}
            className={classnames('exchange-rate', {
              current: currencyAggregator.flipped,
            })}
          >
            <div
              className={classnames('loading-heartbeat', {
                'loading-heartbeat--active': showPriceLoading,
              })}
            />
            <Text variant={TextVariant.bodyXs} color={TextColor.textMuted}>
              Price for 1 {fromAsset}
            </Text>
            <Text variant={TextVariant.bodyLgMedium}>
              {formatLongAmount(rate || 0)} {toAsset}
            </Text>
            {currencyAggregator.value !== ExchangerRateSources.fixedPrice && (
              <Text variant={TextVariant.bodyXs} color={TextColor.textMuted}>
                {RATE_SOURCES_META[currencyAggregator.value]?.title} price{' '}
                {formatLongAmount(originalRate)}
              </Text>
            )}
            <Text variant={TextVariant.bodyXs} color={TextColor.textMuted}>
              Best price {lowestPrice}
            </Text>
          </Box>
          <Box
            width={BLOCK_SIZES.FULL}
            className={classnames('exchange-rate--reversed', {
              current: !currencyAggregator.flipped,
            })}
          >
            <div
              className={classnames('loading-heartbeat', {
                'loading-heartbeat--active': showPriceLoading,
              })}
            />
            <Text variant={TextVariant.bodyXs} color={TextColor.textMuted}>
              Price for 1 {toAsset}
            </Text>
            <Text variant={TextVariant.bodyLgMedium}>
              {formatLongAmount(rate || 0)} {fromAsset}
            </Text>
            {currencyAggregator.value !== ExchangerRateSources.fixedPrice && (
              <Text variant={TextVariant.bodyXs} color={TextColor.textMuted}>
                {RATE_SOURCES_META[currencyAggregator.value]?.title} price{' '}
                {formatLongAmount(originalRate)}
              </Text>
            )}
            <Text variant={TextVariant.bodyXs} color={TextColor.textMuted}>
              Best price {lowestPrice ? 1 / lowestPrice : 0}
            </Text>
          </Box>
          <Icon
            className="exchange-rate-field__swap-rate"
            name={ICON_NAMES.SWAP_VERTICAL}
            size={ICON_SIZES.LG}
            onClick={filpCurrency}
          />
        </Box>
      </LoadingSkeleton>
      <Box className="divider" />
      <LoadingSkeleton isLoading={showLoadingSkeleton}>
        <Box display={DISPLAY.FLEX} width={BLOCK_SIZES.FULL} padding={2}>
          <Button
            className="exchange-rate-field__btn"
            type="link"
            onClick={() => {
              setShowExchangeRatePicker(true);
            }}
            disabled={currencyAggregator.loading}
          >
            <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
              <Icon
                name={ICON_NAMES.SETTING_DEX_2}
                color={IconColor.primaryDefault}
                marginRight={2}
              />
              <Text
                className="nowrap"
                color={Color.primaryDefault}
                size={Size.XS}
              >
                {RATE_SOURCES_META[currencyAggregator.value]?.title}
              </Text>
            </Box>
          </Button>
          <div className="flex-grow" />
          {!currencyAggregator.loading && (
            <>
              {currencyAggregator.value === ExchangerRateSources.fixedPrice ? (
                <Box padding={2}>
                  <TextField
                    type="number"
                    label={`Price per 1 ${
                      currencyAggregator.flipped ? toAsset : fromAsset
                    }`}
                    inputProps={{ inputMode: 'numeric' }}
                    placeholder={t('setFixedPrice')}
                    fullWidth
                    margin="dense"
                    theme="material"
                    value={originalRate}
                    error={currencyAggregator.price <= 0 && t('invalidValue')}
                    endAdornment={
                      <InputAdornment
                        position="start"
                        style={{ marginRight: '5px', marginBottom: '5px' }}
                      >
                        <span>
                          {currencyAggregator.flipped ? fromAsset : toAsset}
                        </span>
                      </InputAdornment>
                    }
                    helpText="per USD"
                    onChange={(e) => {
                      onChange({
                        ...currencyAggregator,
                        value: ExchangerRateSources.fixedPrice,
                        price: currencyAggregator.flipped
                          ? e.target.value
                          : e.target.value && 1 / Number(e.target.value),
                      });
                    }}
                  />
                </Box>
              ) : (
                <Box className="flex-shrink">
                  <NumericField
                    label="Margin"
                    marginTop={5}
                    marginBottom={5}
                    placeholder="0"
                    required
                    name="priceAdjustment"
                    onChange={(v) => setPriceAdjustment(v)}
                    value={currencyAggregator.priceAdjustment}
                    size={Size.LG}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </LoadingSkeleton>
    </Box>
  );
}

ExchangeRateField.propTypes = {
  currencyAggregator: PropTypes.object,
  fromAsset: PropTypes.string,
  toAsset: PropTypes.string,
  onChange: PropTypes.func,
};
