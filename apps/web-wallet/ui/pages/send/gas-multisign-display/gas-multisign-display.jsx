import React, { useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { I18nContext } from '../../../contexts/i18n';
import { useGasFeeContext } from '../../../contexts/gasFee';
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common';
import UserPreferencedCurrencyDisplay from '../../../components/app/user-preferenced-currency-display';
import GasTiming from '../../../components/app/gas-timing';
import InfoTooltip from '../../../components/ui/info-tooltip';
import Typography from '../../../components/ui/typography';
import Button from '../../../components/ui/button';
import Box from '../../../components/ui/box';
import {
  TypographyVariant,
  DISPLAY,
  FLEX_DIRECTION,
  BLOCK_SIZES,
  Color,
  FONT_STYLE,
  FONT_WEIGHT,
} from '../../../helpers/constants/design-system';
import { TokenStandard } from '../../../../shared/constants/transaction';
import LoadingHeartBeat from '../../../components/ui/loading-heartbeat';
import TransactionDetailItem from '../../../components/app/transaction-detail-item';
import { NETWORK_TO_NAME_MAP } from '../../../../shared/constants/network';
import TransactionDetail from '../../../components/app/transaction-detail';
import ActionableMessage from '../../../components/ui/actionable-message';

import {
  getPreferences,
  getIsBuyableChain,
  transactionFeeSelector,
  getUseCurrencyRateCheck,
} from '../../../selectors';

import { INSUFFICIENT_TOKENS_ERROR } from '../send.constants';
import { getCurrentDraftTransaction } from '../../../ducks/send';
import { showModal } from '../../../store/actions';
import {
  addHexes,
  hexWEIToDecETH,
  hexWEIToDecGWEI,
} from '../../../../shared/modules/conversion.utils';
import { EVENT, EVENT_NAMES } from '../../../../shared/constants/metametrics';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import useRamps from '../../../hooks/experiences/useRamps';
import { AssetModel } from '../../../../shared/lib/asset-model';
import { GasMultisignSlider } from './gas-multisign-slider';
import { useAsset } from '../../../hooks/useAsset';

// TODO: remove unused code
const GasMultisignDisplay = ({ gasError }) => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const { estimateUsed } = useGasFeeContext();
  const trackEvent = useContext(MetaMetricsContext);

  const { openBuyCryptoInPdapp } = useRamps();

  const isBuyableChain = useSelector(getIsBuyableChain);
  const draftTransaction = useSelector(getCurrentDraftTransaction);
  const useCurrencyRateCheck = useSelector(getUseCurrencyRateCheck);
  const { useNativeCurrencyAsPrimaryCurrency } = useSelector(getPreferences);
  const { unapprovedTxs } = useSelector((state) => state.metamask);

  const isInsufficientTokenError =
    draftTransaction?.amount.error === INSUFFICIENT_TOKENS_ERROR;

  const editingTransaction = unapprovedTxs[draftTransaction.id];

  // const transactionData = {
  //   txParams: {
  //     gasPrice: draftTransaction.gas?.gasPrice,
  //     gas: editingTransaction?.userEditedGasLimit
  //       ? editingTransaction?.txParams?.gas
  //       : draftTransaction.gas?.gasLimit,
  //     maxFeePerGas: editingTransaction?.txParams?.maxFeePerGas
  //       ? editingTransaction?.txParams?.maxFeePerGas
  //       : draftTransaction.gas?.maxFeePerGas,
  //     maxPriorityFeePerGas: editingTransaction?.txParams?.maxPriorityFeePerGas
  //       ? editingTransaction?.txParams?.maxPriorityFeePerGas
  //       : draftTransaction.gas?.maxPriorityFeePerGas,
  //     assetDetails: draftTransaction.asset.details,
  //     value: draftTransaction.amount?.value,
  //     type: draftTransaction.transactionType,
  //   },
  //   userFeeLevel: editingTransaction?.userFeeLevel,
  // };
  const { asset, gas } = draftTransaction;
  const { details } = asset;
  const { provider } = details;

  const { symbol: nativeCurrency, decimals: nativeDecimals } = useAsset(asset);
  const isMainnet = details.provider.chainId === '0x1';
  // const isTestnet = false;

  // const {
  //   hexMinimumTransactionFee,
  //   hexMaximumTransactionFee,
  //   hexTransactionTotal,
  // } = useSelector((state) => transactionFeeSelector(state, transactionData));

  const hexMaximumTransactionFee = gas.gasTotal || '0x0';
  const hexMinimumTransactionFee = gas.gasTotal || '0x0';
  const hexTransactionTotal = gas.gasTotal || '0x0';

  let title;
  if (
    draftTransaction?.asset.details?.standard === TokenStandard.ERC721 ||
    draftTransaction?.asset.details?.standard === TokenStandard.ERC1155
  ) {
    title = draftTransaction?.asset.details?.name;
  } else {
    title = `${hexWEIToDecETH(draftTransaction.amount.value)} ${
      draftTransaction?.asset.details?.symbol
    }`;
  }

  const ethTransactionTotalMaxAmount = Number(
    hexWEIToDecETH(hexMaximumTransactionFee),
  );
  const primaryTotalTextOverrideMaxAmount = `${title} + ${ethTransactionTotalMaxAmount} ${nativeCurrency}`;
  const showCurrencyRateCheck = useCurrencyRateCheck && isMainnet;

  let detailTotal, maxAmount;

  if (draftTransaction?.asset.type === 'NATIVE') {
    detailTotal = (
      <Box
        height={BLOCK_SIZES.MAX}
        display={DISPLAY.FLEX}
        flexDirection={FLEX_DIRECTION.COLUMN}
        className="gas-display__total-value"
      >
        <LoadingHeartBeat
          provider={provider}
          // estimateUsed={transactionData?.userFeeLevel}
        />
        <UserPreferencedCurrencyDisplay
          type={PRIMARY}
          key="total-detail-value"
          value={hexTransactionTotal}
          hideLabel={!useNativeCurrencyAsPrimaryCurrency}
          ticker={details.symbol}
          shiftBy={details.decimals}
        />
      </Box>
    );
    maxAmount = (
      <UserPreferencedCurrencyDisplay
        type={PRIMARY}
        key="total-max-amount"
        value={addHexes(
          draftTransaction.amount.value,
          hexMaximumTransactionFee,
        )}
        hideLabel={!useNativeCurrencyAsPrimaryCurrency}
        provider={provider}
        ticker={details.symbol}
        shiftBy={details.decimals}
      />
    );
  } else if (useNativeCurrencyAsPrimaryCurrency) {
    detailTotal = primaryTotalTextOverrideMaxAmount;
    maxAmount = primaryTotalTextOverrideMaxAmount;
  }

  return (
    <>
      <Box className="gas-display">
        <TransactionDetail
          userAcknowledgedGasMissing={false}
          rows={[
            <TransactionDetailItem
              key="gas-item"
              detailTitle={
                <Box display={DISPLAY.FLEX}>
                  <Box marginRight={1}>{t('commission')}&#58;</Box>
                </Box>
              }
              detailTitleColor={Color.textDefault}
              detailText={
                <Box className="gas-display__currency-container">
                  <LoadingHeartBeat
                    provider={provider}
                    estimateUsed={estimateUsed}
                  />
                  <UserPreferencedCurrencyDisplay
                    type={SECONDARY}
                    value={gas.gasTotal || '0x0'}
                    ticker={nativeCurrency}
                    shiftBy={nativeDecimals}
                  />
                </Box>
              }
              detailTotal={
                <Box className="gas-display__currency-container">
                  <LoadingHeartBeat
                    provider={provider}
                    estimateUsed={estimateUsed}
                  />
                  <UserPreferencedCurrencyDisplay
                    type={PRIMARY}
                    value={gas.gasTotal || '0x0'}
                    ticker={nativeCurrency}
                    shiftBy={nativeDecimals}
                    native
                  />
                </Box>
              }
              subTitle={<GasMultisignSlider />}
            />,
          ]}
        />
      </Box>
    </>
  );
};

GasMultisignDisplay.propTypes = {
  gasError: PropTypes.string,
};

export default GasMultisignDisplay;
