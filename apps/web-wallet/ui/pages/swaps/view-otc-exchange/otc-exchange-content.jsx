import BigNumber from 'bignumber.js';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from '../../../components/component-library';
import Box from '../../../components/ui/box';
import LoadingSkeleton from '../../../components/ui/loading-skeleton';
import {
  getFromToken,
  getFromTokenInputValue,
  getSwapOTC,
  getToToken,
} from '../../../ducks/swaps/swaps';
import {
  DISPLAY,
  TextColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { showModal } from '../../../store/actions';
import FeeCard from '../fee-card';

const formatter = (num) =>
  new Intl.NumberFormat('en-US', { maximumSignificantDigits: 6 }).format(num);

const MAX_UNSIGNED_256_INT = new BigNumber(2).pow(256).minus(1).toString(10);

const OtcExchangeContent = ({ provider }) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const fromTokenInputValue = useSelector(getFromTokenInputValue);
  const { loading } = useSelector(getSwapOTC);

  const { name, toAmount, minAmount, rate, error, message } = provider;

  const providerError = useMemo(() => error || message, [error, message]);

  const onFeeCardTokenApprovalClick = useCallback(() => {
    const origin = 'Swap Router Test origin';
    dispatch(
      showModal({
        name: 'EDIT_APPROVAL_PERMISSION',
        setCustomAmount: (newCustomPermissionAmount) => {
          console.log(
            'EDIT_APPROVAL_PERMISSION => newCustomPermissionAmount',
            newCustomPermissionAmount,
          );
        },
        decimals: fromToken.decimals,
        origin,
        tokenBalance: fromToken.balance,
        tokenAmount: MAX_UNSIGNED_256_INT,
        customTokenAmount: fromTokenInputValue,
        tokenSymbol: fromToken.symbol,
        requiredMinimum: fromTokenInputValue,
      }),
    );
  }, [dispatch, fromToken, fromTokenInputValue]);

  return (
    <div className="p2p-exchange__row">
      <div className="row-summary">
        <Box display={DISPLAY.FLEX}>
          <Text
            color={TextColor.inherit}
            variant={TextVariant.headingSm}
            className="flex-grow"
            as="span"
          >
            {t('provider')}
          </Text>
          <Text
            color={TextColor.inherit}
            variant={TextVariant.headingSm}
            className="row-summary__value"
            as="span"
          >
            {name}
          </Text>
        </Box>

        {!providerError && Boolean(toAmount) && (
          <Box display={DISPLAY.FLEX} marginBottom={1}>
            <Text
              color={TextColor.inherit}
              variant={TextVariant.inherit}
              className="flex-grow"
              as="span"
            >
              {fromToken?.symbol}
            </Text>
            <LoadingSkeleton isLoading={loading}>
              <Text
                color={TextColor.successDefault}
                variant={TextVariant.inherit}
                className="row-summary__value"
                as="span"
              >
                {formatter(toAmount)}&nbsp;{toToken?.symbol}
              </Text>
            </LoadingSkeleton>
          </Box>
        )}

        {!providerError && Boolean(rate) && (
          <Box display={DISPLAY.FLEX} marginBottom={2}>
            <Text
              color={TextColor.inherit}
              variant={TextVariant.inherit}
              className="flex-grow"
              as="span"
            >
              {t('swapsExchangeRate')}
            </Text>
            <LoadingSkeleton isLoading={loading}>
              <Box display={DISPLAY.FLEX}>
                <span className="row-summary__value">
                  <span>1&nbsp;</span>
                  <span>{fromToken.symbol}</span>
                  &nbsp;
                </span>
                <span>
                  <span>&#8776;</span>
                </span>
                <span>
                  &nbsp;
                  <span>{formatter(rate)}&nbsp;</span>
                  <span>{toToken.symbol}</span>
                </span>
              </Box>
            </LoadingSkeleton>
          </Box>
        )}

        {Boolean(minAmount) && (
          <Box display={DISPLAY.FLEX} marginBottom={1}>
            <Text
              color={TextColor.inherit}
              variant={TextVariant.inherit}
              className="flex-grow"
              as="span"
            >
              {t('swapsMinAmount')}
            </Text>
            <LoadingSkeleton isLoading={loading}>
              <Text
                color={
                  fromTokenInputValue < minAmount
                    ? TextColor.errorDefault
                    : TextColor.inherit
                }
                variant={TextVariant.inherit}
                className="row-summary__value"
                as="span"
              >
                {minAmount}&nbsp;{fromToken?.symbol}
              </Text>
            </LoadingSkeleton>
          </Box>
        )}

        {Boolean(providerError) && (
          <Box display={DISPLAY.FLEX}>
            <Text
              color={TextColor.errorDefault}
              variant={TextVariant.bodyMd}
              className="flex-grow"
              as="span"
            >
              {providerError}
            </Text>
          </Box>
        )}
      </div>
    </div>
  );
};

OtcExchangeContent.propTypes = {
  provider: PropTypes.shape({
    name: PropTypes.string.isRequired,
    error: PropTypes.string,
    message: PropTypes.string,
    minAmount: PropTypes.number,
    toAmount: PropTypes.number,
    rate: PropTypes.number,
  }),
};

export default memo(OtcExchangeContent);
