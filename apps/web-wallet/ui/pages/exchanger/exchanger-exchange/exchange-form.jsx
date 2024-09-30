import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useI18nContext } from '../../../hooks/useI18nContext';

import Box from '../../../components/ui/box/box';
import {
  DISPLAY,
  IconColor,
  AlignItems,
  Color,
  BLOCK_SIZES,
  TextVariant,
  RESIZE,
  JustifyContent,
  BackgroundColor,
  BorderRadius,
  BorderColor,
} from '../../../helpers/constants/design-system';
import {
  Button,
  ICON_NAMES,
  Icon,
  Text,
} from '../../../components/component-library';

import DropdownTokensPair from '../dropdown-tokens-pair';
import BankAccountPicker from '../../../components/app/modals/bank-account-picker/bank-account-picker';
import NumericInput from '../../../components/ui/numeric-input';
import Textarea from '../../../components/ui/textarea';
import { getStrPaymentMethodInstance } from '../../../../shared/lib/payment-methods-utils';
import { formatLongAmount } from '../../../../shared/lib/ui-utils';
import CheckBox from '../../../components/ui/check-box';
import ExchangeRateField from './exchange-rate-field';

export default function ExchangeForm({
  value,
  errors,
  allReserves,
  allTokens,
  onChange,
  setErros,
}) {
  const t = useI18nContext();
  const [showBankAccountPicker, setShowBankAccountPicker] = useState(false);
  const pairsSelected = value.fromAsset && value.toAsset;
  const isCryptoAd =
    pairsSelected && !value.fromAsset.isFiat && !value.toAsset.isFiat;
  const availableBalance =
    value.toAsset?.reserve || value.paymentMethod?.balance;

  const updateValue = (field, v) => {
    const update = {
      [field]: v,
    };
    onChange(update);
  };

  useEffect(() => {
    const invalidValue = t('invalidValue');
    const errs = {};
    if (value.transactionFee < 0) {
      errs.transactionFee = invalidValue;
    }
    if (value.minAmount < 0) {
      errs.minAmount = invalidValue;
    }
    if (value.maxAmount < 0) {
      errs.maxAmount = invalidValue;
    }
    setErros(errs);
  }, [value, setErros, t]);

  return (
    <Box className="exchanger-card" padding={4}>
      {showBankAccountPicker && (
        <BankAccountPicker
          value={value.paymentMethod}
          currency={value.fromAsset.localId}
          onSelect={(v) => {
            updateValue('paymentMethod', v);
          }}
          onClose={() => {
            setShowBankAccountPicker(false);
          }}
        />
      )}
      <DropdownTokensPair
        selectedItemFrom={value.fromAsset}
        selectedItemTo={value.toAsset}
        itemsToSearchFrom={allTokens}
        itemsToSearchTo={allReserves}
        onChange={(tokens) => {
          onChange({
            ...value,
            ...tokens,
          });
        }}
        searchPlaceholderTextFrom="You get"
        searchPlaceholderTextTo="You give "
        fuseSearchKeys={[
          { name: 'name', weight: 0.5 },
          { name: 'symbol', weight: 0.5 },
        ]}
        disableFlip={value.currencyAggregator?.loading}
      />

      {isCryptoAd && (
        <Box
          display={DISPLAY.FLEX}
          alignItems={AlignItems.center}
          backgroundColor={BackgroundColor.backgroundDefault}
          padding={4}
          borderRadius={BorderRadius.XL}
          marginBottom={3}
          borderColor={BorderColor.borderMuted}
        >
          <CheckBox
            checked={value.isAtomicSwap}
            id="isAtomicSwap"
            title="Atomic swap"
            onClick={() => updateValue('isAtomicSwap', !value.isAtomicSwap)}
          />
          <label htmlFor="isAtomicSwap">
            <Text marginLeft={2} variant={TextVariant.bodySm}>
              Atomic swap
            </Text>
          </label>
        </Box>
      )}
      {value.toAsset && value.fromAsset && (
        <ExchangeRateField
          currencyAggregator={value.currencyAggregator}
          fromAsset={value.fromAsset.symbol}
          toAsset={value.toAsset.symbol}
          priceAdjustment={value.priceAdjustment}
          onChange={(val) => updateValue('currencyAggregator', val)}
        />
      )}

      {availableBalance && (
        <Box
          display={DISPLAY.FLEX}
          justifyContent={JustifyContent.spaceBetween}
          backgroundColor={BackgroundColor.backgroundDefault}
          marginTop={3}
          padding={4}
          borderRadius={BorderRadius.XL}
          marginBottom={3}
          borderColor={BorderColor.borderMuted}
        >
          <Text variant={TextVariant.bodyMdBold}>Balance</Text>
          <Text>
            {formatLongAmount(availableBalance, value.toAsset.symbol)}
          </Text>
        </Box>
      )}
      {value.currencyAggregator && value.toAsset && value.fromAsset && (
        <Box>
          {!isCryptoAd && (
            <>
              <Box display={DISPLAY.FLEX} marginTop={4}>
                <Button
                  type="link"
                  block
                  textProps={{
                    width: BLOCK_SIZES.FULL,
                  }}
                  onClick={() => {
                    setShowBankAccountPicker(true);
                  }}
                >
                  <Box
                    display={DISPLAY.FLEX}
                    width={BLOCK_SIZES.FULL}
                    alignItems={AlignItems.center}
                  >
                    <Icon
                      name={ICON_NAMES.ADD_PAYMENT_METHOD}
                      color={IconColor.primaryDefault}
                      marginRight={2}
                    />
                    {value.paymentMethod ? (
                      <>
                        <Text color={Color.primaryDefault}>
                          {getStrPaymentMethodInstance(value.paymentMethod)}
                        </Text>
                        <div className="flex-grow" />
                        <Text color={Color.primaryDefault}>{t('change')}</Text>
                      </>
                    ) : (
                      <Text color={Color.textMuted}>
                        {t('selectPaymentMehtodPlaceholder')}
                      </Text>
                    )}
                  </Box>
                </Button>
              </Box>
              <Box marginTop={2}>
                <Text variant={TextVariant.bodyMdBold}>Client time to pay</Text>
                <NumericInput
                  value={value.timeToPay}
                  placeholder="15 min"
                  required
                  error={Boolean(errors.timeToPay)}
                  name="timeToPay"
                  onChange={(v) => updateValue('timeToPay', v)}
                  helpText="minutes"
                />
              </Box>
            </>
          )}

          {(value.fromAsset.isFiat || value.toAsset.isFiat) && (
            <Box marginTop={5} marginBottom={5}>
              <Text variant={TextVariant.bodyMdBold}>Info for customers</Text>
              <Textarea
                value={value.exchangersPolicy}
                placeholder="Describe exchange details..."
                resize={RESIZE.NONE}
                name="exchangersPolicy"
                onChange={(e) =>
                  updateValue('exchangersPolicy', e.target.value)
                }
                helpText={value.fromAsset.symbol}
              />
            </Box>
          )}
          <Box marginTop={5} marginBottom={5}>
            <Text variant={TextVariant.bodyMdBold}>
              {t('reserveLimitation')}
            </Text>
            <NumericInput
              value={value.reserveLimitation}
              placeholder={t('noLimits')}
              error={Boolean(errors.reserveLimitation)}
              name="reserveLimitation"
              onChange={(v) => updateValue('reserveLimitation', v)}
              helpText={value.toAsset.symbol}
            />
          </Box>
          <Box marginTop={5} marginBottom={5}>
            <Text variant={TextVariant.bodyMdBold}>{t('transactionFee')}</Text>
            <NumericInput
              value={value.transactionFee}
              placeholder={t('auto')}
              required
              error={Boolean(errors.transactionFee)}
              name="transactionFee"
              onChange={(v) => updateValue('transactionFee', v)}
              helpText={value.toAsset.symbol}
            />
          </Box>
          <Box marginTop={5} marginBottom={5}>
            <Text variant={TextVariant.bodyMdBold}>{t('minAmount')}</Text>
            <NumericInput
              value={value.minAmount}
              placeholder={t('notSpecify')}
              required
              error={Boolean(errors.minAmount)}
              name="minAmount"
              onChange={(v) => updateValue('minAmount', v)}
              helpText={value.fromAsset.symbol}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
ExchangeForm.propTypes = {
  value: PropTypes.object,
  allReserves: PropTypes.array,
  allTokens: PropTypes.array,
  onDelete: PropTypes.func,
  onChange: PropTypes.func,
  errors: PropTypes.object,
  setErros: PropTypes.func,
};
