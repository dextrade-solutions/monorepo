import React, { useContext, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

import TextField from '../text-field';
import UrlIcon from '../url-icon/url-icon';
import { I18nContext } from '../../../contexts/i18n';
import { calcTokenAmount } from '../../../../shared/lib/transactions-controller-utils';
import { Text, Button, ICON_NAMES, Icon } from '../../component-library';
import {
  AlignItems,
  BLOCK_SIZES,
  DISPLAY,
  IconColor,
  TextColor,
} from '../../../helpers/constants/design-system';
import Box from '../box/box';

import { formatCurrency } from '../../../helpers/utils/confirm-tx.util';
import { formatLongAmount, textChangeHandler } from '../../../../shared/lib/ui-utils';
import LoadingIndicator from '../loading-indicator/loading-indicator';
import FiatPicker from '../../app/modals/fiat-picker/fiat-picker';

import BankAccountPicker from '../../app/modals/bank-account-picker/bank-account-picker';
import { getStrPaymentMethodInstance } from '../../../../shared/lib/payment-methods-utils';

export default function AssetInputCard({
  asset,
  hidePaymentMethods,
  onChange,
  validate,
  onBlur,
  value,
  reserve,
  readonlyCoin = false,
  readonlyInput = false,
  disabledBalance = false,
  isReserveToken,
  placeholder = '0',
  error = '',
  onMax = null,
  renderFooter,
}) {
  const inputRef = useRef();
  const [showFiatPicker, setShowFiatPicker] = useState(false);
  const [showBankAccountPicker, setShowBankAccountPicker] = useState(false);
  let maxValue;
  let tokenBalance;

  const t = useContext(I18nContext);
  if (asset?.isFiat) {
    maxValue = reserve;
  } else if (asset) {
    tokenBalance = calcTokenAmount(
      asset.balance || 0,
      asset.decimals,
    ).toNumber();
    maxValue = tokenBalance;
    if (isReserveToken || reserve < tokenBalance) {
      maxValue = reserve;
    }
  }
  const maxModeOn = value.amount === maxValue;
  const coinImg = asset?.getIconUrl();

  const onChangeHandler = (key, val) => {
    if (key === 'amount' && value.loading) {
      return;
    }
    const updateValue = {
      ...value,
      touched: true,
      [key]: val,
    };
    onChange(updateValue);
    inputRef?.current?.focus();
  };

  const balanceError =
    asset &&
    !asset.isFiat &&
    value.amount > maxValue &&
    t('insufficientBalance');
  const amountError = value.amount <= 0 && t('invalidValue');
  const errors = balanceError || amountError || error;

  useEffect(() => {
    validate && validate(errors);
  }, [errors, validate]);

  // if (!isFiat && !standard) {
  //   return (
  //     <div className="coin-input-card">
  //       <Text>
  //         {value.coin.ticker} {value.coin.networkType} is not added in your
  //         wallet
  //       </Text>
  //     </div>
  //   );
  // }
  return (
    <div className="coin-input-card">
      {showBankAccountPicker && (
        <BankAccountPicker
          currency={asset.localId}
          value={value.paymentMethod}
          onSelect={(v) => {
            onChangeHandler('paymentMethod', v);
          }}
          onClose={() => {
            setShowBankAccountPicker(false);
          }}
        />
      )}
      {showFiatPicker && (
        <FiatPicker
          value={value.symbol}
          onSelect={(v) => {
            onChangeHandler('asset', v);
          }}
          onClose={() => {
            setShowFiatPicker(false);
          }}
        />
      )}
      {(!asset || asset.isFiat) && (
        <div className="fiat-input-card__fiat-info">
          <Button
            type="link"
            onClick={() => !readonlyCoin && setShowFiatPicker(true)}
          >
            <Box display={DISPLAY.FLEX} alignItems={AlignItems.center}>
              {asset ? (
                <>
                  <div>
                    <UrlIcon url={coinImg} />
                  </div>
                  <Text marginLeft={2} marginRight={2}>
                    {asset.symbol}
                  </Text>
                </>
              ) : (
                <>
                  <UrlIcon url="./images/dextrade-placeholder.svg" />
                  <Text marginLeft={2} color={TextColor.textMuted}>
                    Choose fiat
                  </Text>
                </>
              )}
            </Box>
          </Button>
        </div>
      )}
      {asset && !asset.isFiat && (
        <div className="coin-input-card__token-info">
          <Box
            display={DISPLAY.FLEX}
            alignItems={AlignItems.center}
            className="flex-grow"
          >
            {coinImg && <UrlIcon url={coinImg} name={asset.symbol} />}
            {!coinImg && <div className="default-token-icon" />}
            <Text marginLeft={2} marginRight={2}>
              {asset.symbol}
            </Text>
            {asset.standard && (
              <div className="network-type-label">{asset.standard}</div>
            )}
          </Box>
        </div>
      )}
      <div className="coin-input-card__input-amount">
        <div className="flex-grow">
          <TextField
            inputRef={inputRef}
            disabled={readonlyInput}
            endAdornment={
              <>
                {value.loading && !readonlyInput && (
                  <Box marginRight={2}>
                    <LoadingIndicator
                      isLoading
                      title="Updating amount..."
                      alt="loading"
                    />
                  </Box>
                )}
                {!value.loading && !readonlyInput && (
                  <button
                    className="send-v2__amount-max"
                    onClick={() =>
                      maxModeOn
                        ? onChangeHandler('amount', 0)
                        : onMax?.() || onChangeHandler('amount', maxValue)
                    }
                  >
                    <input type="checkbox" checked={maxModeOn} readOnly />
                    <div className="send-v2__amount-max__button">
                      {t('max')}
                    </div>
                  </button>
                )}
              </>
            }
            type="number"
            placeholder={placeholder}
            fullWidth
            margin="dense"
            theme="material"
            value={value.amount}
            error={
              (value.touched ||
                (value.amount || placeholder) !== placeholder) &&
              errors
            }
            onChange={(e) => {
              onChangeHandler('amount', textChangeHandler(e));
            }}
            onBlur={(e) =>
              onBlur && onBlur(onChangeHandler('amount', textChangeHandler(e)))
            }
          />
          {Boolean(value.price) && (
            <Text color={TextColor.textAlternative}>
              {formatCurrency(value.amount * value.price, 'usd')}
            </Text>
          )}
        </div>
      </div>
      {asset && !asset.isFiat && !disabledBalance && (
        <Text color={TextColor.textMuted} marginRight={1}>
          {t('balance')} {formatLongAmount(tokenBalance)}
        </Text>
      )}
      {reserve !== undefined && (
        <Text color={TextColor.textMuted} marginTop={1}>
          {t('limits')} {formatLongAmount(reserve)}
        </Text>
      )}
      {renderFooter && (
        <Box>
          <Box className="divider" marginTop={3} marginBottom={3} />
          {renderFooter()}
        </Box>
      )}
      {asset?.isFiat && !hidePaymentMethods && (
        <>
          <Box className="divider" marginTop={3} marginBottom={3} />
          <Box display={DISPLAY.FLEX}>
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
                    <Text color={TextColor.primaryDefault}>
                      {getStrPaymentMethodInstance(value.paymentMethod)}
                    </Text>
                    <div className="flex-grow" />
                    <Text color={TextColor.primaryDefault}>Change</Text>
                  </>
                ) : (
                  <Text color={TextColor.textMuted}>
                    {t('selectPaymentMehtodPlaceholder')}
                  </Text>
                )}
              </Box>
            </Button>
          </Box>
        </>
      )}
    </div>
  );
}

AssetInputCard.propTypes = {
  asset: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
  validate: PropTypes.func,
  onBlur: PropTypes.func,
  onMax: PropTypes.func,
  reserve: PropTypes.number,
  readonlyCoin: PropTypes.bool,
  readonlyInput: PropTypes.bool,
  isReserveToken: PropTypes.bool,
  hidePaymentMethods: PropTypes.bool,
  disabledBalance: PropTypes.bool,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  renderFooter: PropTypes.func,
};
