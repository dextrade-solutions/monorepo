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
  getSwapDEX,
  getSwapsHeaderTitle,
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

const DexExchangeContent = ({ provider, setCustomApproveValue }) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const fromToken = useSelector(getFromToken, isEqual);
  const toToken = useSelector(getToToken, isEqual);
  const inputValue = useSelector(getFromTokenInputValue);
  const { loading } = useSelector(getSwapDEX);
  const swapHeaderTitle = useSelector(getSwapsHeaderTitle);

  const { name, toAmount, minAmount, rate, error, message, hasApproval } =
    provider;

  const providerError = useMemo(() => error || message, [error, message]);

  const onFeeCardTokenApprovalClick = useCallback(() => {
    const origin = 'Swap Router Test origin';
    dispatch(
      showModal({
        name: 'EDIT_APPROVAL_PERMISSION',
        setCustomAmount: (newCustomPermissionAmount) => {
          setCustomApproveValue?.(newCustomPermissionAmount);
        },
        decimals: fromToken.decimals,
        origin,
        tokenBalance: fromToken.balance,
        tokenAmount: MAX_UNSIGNED_256_INT,
        customTokenAmount: inputValue,
        tokenSymbol: fromToken.symbol,
        requiredMinimum: inputValue,
      }),
    );
  }, [
    dispatch,
    fromToken.balance,
    fromToken.decimals,
    fromToken.symbol,
    inputValue,
    setCustomApproveValue,
  ]);

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

        {Boolean(inputValue) && !providerError && Boolean(toAmount) && (
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

        {Boolean(inputValue) && !providerError && Boolean(rate) && (
          <Box display={DISPLAY.FLEX} marginBottom={3}>
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

        {Boolean(inputValue) && Boolean(minAmount) && (
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
                  inputValue < minAmount
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

        {Boolean(inputValue) && Boolean(providerError) && (
          <Box display={DISPLAY.FLEX} marginBottom={2}>
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

        {Boolean(inputValue) &&
          !hasApproval &&
          !providerError &&
          Boolean(inputValue) && (
            <Box display={DISPLAY.FLEX} marginBottom={1}>
              <FeeCard
                hideTransactionDetailRow
                hideTokenApprovalRow={false}
                tokenApprovalSourceTokenSymbol={fromToken?.symbol}
                onTokenApprovalClick={onFeeCardTokenApprovalClick}
                chainId={fromToken?.chainId}
                isBestQuote
              />
            </Box>
          )}

        {/* {Boolean(fee) && (*/}
        {/*  <>*/}
        {/*    <Box display={DISPLAY.FLEX} marginBottom={2}>*/}
        {/*      <span className="flex-grow">{t('commission')}</span>*/}
        {/*      <span className="row-summary__value">*/}
        {/*        {fee}&nbsp;{fromToken?.symbol}*/}
        {/*      </span>*/}
        {/*    </Box>*/}
        {/*    <Box display={DISPLAY.FLEX} marginBottom={2}>*/}
        {/*      <span className="flex-grow">{t('total')}</span>*/}
        {/*      <span className="row-summary__value">*/}
        {/*        {Number(fee) + Number(inputValue)}&nbsp;*/}
        {/*        {fromToken?.symbol}*/}
        {/*      </span>*/}
        {/*    </Box>*/}
        {/*  </>*/}
        {/* )}*/}
      </div>
    </div>
  );
};

DexExchangeContent.propTypes = {
  setCustomApproveValue: PropTypes.func,
  provider: PropTypes.shape({
    name: PropTypes.string.isRequired,
    error: PropTypes.string,
    message: PropTypes.string,
    minAmount: PropTypes.number,
    toAmount: PropTypes.number,
    rate: PropTypes.number,
    hasApproval: PropTypes.bool,
  }),
};

export default memo(DexExchangeContent);
