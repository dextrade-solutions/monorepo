import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { TextColor } from '../../../helpers/constants/design-system';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import { getPreferences, getUseCurrencyRateCheck } from '../../../selectors';
import { useGasFeeContext } from '../../../contexts/gasFee';
import { useI18nContext } from '../../../hooks/useI18nContext';

import Box from '../../ui/box';
import LoadingHeartBeat from '../../ui/loading-heartbeat';
import GasTiming from '../gas-timing/gas-timing.component';
import TransactionDetailItem from '../transaction-detail-item/transaction-detail-item.component';
import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display';
import GasDetailsItemTitle from './gas-details-item-title';

const GasDetailsItem = ({
  chainId,
  nativeCurrency,
  nativeDecimals,
  userAcknowledgedGasMissing = false,
}) => {
  const t = useI18nContext();
  const {
    estimateUsed,
    hasSimulationError,
    maximumCostInHexWei: hexMaximumTransactionFee,
    minimumCostInHexWei: hexMinimumTransactionFee,
    maxPriorityFeePerGas,
    maxFeePerGas,
  } = useGasFeeContext();

  const { useNativeCurrencyAsPrimaryCurrency } = useSelector(getPreferences);

  const useCurrencyRateCheck = useSelector(getUseCurrencyRateCheck);

  if (hasSimulationError && !userAcknowledgedGasMissing) {
    return null;
  }

  return (
    <TransactionDetailItem
      key="gas-item"
      detailTitle={<GasDetailsItemTitle />}
      detailTitleColor={TextColor.textDefault}
      detailText={
        useCurrencyRateCheck && (
          <div className="gas-details-item__currency-container">
            <LoadingHeartBeat chainId={chainId} estimateUsed={estimateUsed} />
            <UserPreferencedCurrencyDisplay
              type={SECONDARY}
              value={hexMinimumTransactionFee}
              hideLabel={Boolean(useNativeCurrencyAsPrimaryCurrency)}
              ticker={nativeCurrency}
              shiftBy={nativeDecimals}
            />
          </div>
        )
      }
      detailTotal={
        <div className="gas-details-item__currency-container">
          <LoadingHeartBeat chainId={chainId} estimateUsed={estimateUsed} />
          <UserPreferencedCurrencyDisplay
            type={PRIMARY}
            value={hexMinimumTransactionFee}
            hideLabel={!useNativeCurrencyAsPrimaryCurrency}
            ticker={nativeCurrency}
            shiftBy={nativeDecimals}
          />
        </div>
      }
      subText={
        <>
          <Box
            key="editGasSubTextFeeLabel"
            display="inline-flex"
            className={classNames('gas-details-item__gasfee-label', {
              'gas-details-item__gas-fee-warning': estimateUsed === 'high',
            })}
          >
            <LoadingHeartBeat chainId={chainId} estimateUsed={estimateUsed} />
            <Box marginRight={1}>
              <strong>
                {estimateUsed === 'high' && '⚠ '}
                {t('editGasSubTextFeeLabel')}
              </strong>
            </Box>
            <div
              key="editGasSubTextFeeValue"
              className="gas-details-item__currency-container"
            >
              <LoadingHeartBeat chainId={chainId} estimateUsed={estimateUsed} />
              <UserPreferencedCurrencyDisplay
                key="editGasSubTextFeeAmount"
                type={PRIMARY}
                value={hexMaximumTransactionFee}
                hideLabel={!useNativeCurrencyAsPrimaryCurrency}
                ticker={nativeCurrency}
                shiftBy={nativeDecimals}
              />
            </div>
          </Box>
        </>
      }
      subTitle={
        <GasTiming
          maxPriorityFeePerGas={maxPriorityFeePerGas.toString()}
          maxFeePerGas={maxFeePerGas.toString()}
        />
      }
    />
  );
};

GasDetailsItem.propTypes = {
  userAcknowledgedGasMissing: PropTypes.bool,
  chainId: PropTypes.string,
  nativeCurrency: PropTypes.string,
  nativeDecimals: PropTypes.number,
};

export default GasDetailsItem;
