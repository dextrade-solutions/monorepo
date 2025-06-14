import { createSelector } from 'reselect';
import txHelper from '../helpers/utils/tx-helper';
import {
  roundExponential,
  getTransactionFee,
  addFiat,
  addEth,
} from '../helpers/utils/confirm-tx.util';
import {
  getGasEstimateType,
  getGasFeeEstimates,
} from '../ducks/metamask/metamask';
import { TransactionEnvelopeType } from '../../shared/constants/transaction';
import {
  GasEstimateTypes,
  CUSTOM_GAS_ESTIMATE,
} from '../../shared/constants/gas';
import {
  getMaximumGasTotalInHexWei,
  getMinimumGasTotalInHexWei,
} from '../../shared/modules/gas.utils';
import { isEqualCaseInsensitive } from '../../shared/modules/string-utils';
import { calcTokenAmount } from '../../shared/lib/transactions-controller-utils';
import {
  decGWEIToHexWEI,
  getValueFromWeiHex,
  sumHexes,
} from '../../shared/modules/conversion.utils';
import { AssetModel } from '../../shared/lib/asset-model';
import { getAveragePriceEstimateInHexWEI } from './custom-gas';
import { deprecatedGetCurrentNetworkId } from './selectors';

const unapprovedTxsSelector = (state) => state.metamask.unapprovedTxs;
const unapprovedMsgsSelector = (state) => state.metamask.unapprovedMsgs;
const unapprovedPersonalMsgsSelector = (state) =>
  state.metamask.unapprovedPersonalMsgs;
const unapprovedDecryptMsgsSelector = (state) =>
  state.metamask.unapprovedDecryptMsgs;
const unapprovedEncryptionPublicKeyMsgsSelector = (state) =>
  state.metamask.unapprovedEncryptionPublicKeyMsgs;
const unapprovedTypedMessagesSelector = (state) =>
  state.metamask.unapprovedTypedMessages;

export const unconfirmedTransactionsListSelector = createSelector(
  unapprovedTxsSelector,
  unapprovedMsgsSelector,
  unapprovedPersonalMsgsSelector,
  unapprovedDecryptMsgsSelector,
  unapprovedEncryptionPublicKeyMsgsSelector,
  unapprovedTypedMessagesSelector,
  deprecatedGetCurrentNetworkId,
  (
    unapprovedTxs = {},
    unapprovedMsgs = {},
    unapprovedPersonalMsgs = {},
    unapprovedDecryptMsgs = {},
    unapprovedEncryptionPublicKeyMsgs = {},
    unapprovedTypedMessages = {},
    network,
    chainId,
  ) =>
    txHelper(
      unapprovedTxs,
      unapprovedMsgs,
      unapprovedPersonalMsgs,
      unapprovedDecryptMsgs,
      unapprovedEncryptionPublicKeyMsgs,
      unapprovedTypedMessages,
      network,
      chainId,
    ) || [],
);

export const unconfirmedTransactionsHashSelector = createSelector(
  unapprovedTxsSelector,
  unapprovedMsgsSelector,
  unapprovedPersonalMsgsSelector,
  unapprovedDecryptMsgsSelector,
  unapprovedEncryptionPublicKeyMsgsSelector,
  unapprovedTypedMessagesSelector,
  deprecatedGetCurrentNetworkId,
  (
    unapprovedTxs = {},
    unapprovedMsgs = {},
    unapprovedPersonalMsgs = {},
    unapprovedDecryptMsgs = {},
    unapprovedEncryptionPublicKeyMsgs = {},
    unapprovedTypedMessages = {},
  ) => {
    const filteredUnapprovedTxs = Object.keys(unapprovedTxs).reduce(
      (acc, address) => {
        const transactions = { ...acc };

        // if (
        // transactionMatchesNetwork(unapprovedTxs[address], chainId, network)
        // ) {
        transactions[address] = unapprovedTxs[address];
        // }

        return transactions;
      },
      {},
    );

    return {
      ...filteredUnapprovedTxs,
      ...unapprovedMsgs,
      ...unapprovedPersonalMsgs,
      ...unapprovedDecryptMsgs,
      ...unapprovedEncryptionPublicKeyMsgs,
      ...unapprovedTypedMessages,
    };
  },
);

export const unconfirmedMessagesHashSelector = createSelector(
  unapprovedMsgsSelector,
  unapprovedPersonalMsgsSelector,
  unapprovedDecryptMsgsSelector,
  unapprovedEncryptionPublicKeyMsgsSelector,
  unapprovedTypedMessagesSelector,
  (
    unapprovedMsgs = {},
    unapprovedPersonalMsgs = {},
    unapprovedDecryptMsgs = {},
    unapprovedEncryptionPublicKeyMsgs = {},
    unapprovedTypedMessages = {},
  ) => {
    return {
      ...unapprovedMsgs,
      ...unapprovedPersonalMsgs,
      ...unapprovedDecryptMsgs,
      ...unapprovedEncryptionPublicKeyMsgs,
      ...unapprovedTypedMessages,
    };
  },
);

const unapprovedMsgCountSelector = (state) => state.metamask.unapprovedMsgCount;
const unapprovedPersonalMsgCountSelector = (state) =>
  state.metamask.unapprovedPersonalMsgCount;
const unapprovedDecryptMsgCountSelector = (state) =>
  state.metamask.unapprovedDecryptMsgCount;
const unapprovedEncryptionPublicKeyMsgCountSelector = (state) =>
  state.metamask.unapprovedEncryptionPublicKeyMsgCount;
const unapprovedTypedMessagesCountSelector = (state) =>
  state.metamask.unapprovedTypedMessagesCount;

export const unconfirmedTransactionsCountSelector = createSelector(
  unapprovedTxsSelector,
  unapprovedMsgCountSelector,
  unapprovedPersonalMsgCountSelector,
  unapprovedDecryptMsgCountSelector,
  unapprovedEncryptionPublicKeyMsgCountSelector,
  unapprovedTypedMessagesCountSelector,
  deprecatedGetCurrentNetworkId,
  (
    unapprovedTxs = {},
    unapprovedMsgCount = 0,
    unapprovedPersonalMsgCount = 0,
    unapprovedDecryptMsgCount = 0,
    unapprovedEncryptionPublicKeyMsgCount = 0,
    unapprovedTypedMessagesCount = 0,
  ) => {
    const filteredUnapprovedTxIds = Object.keys(unapprovedTxs);

    return (
      filteredUnapprovedTxIds.length +
      unapprovedTypedMessagesCount +
      unapprovedMsgCount +
      unapprovedPersonalMsgCount +
      unapprovedDecryptMsgCount +
      unapprovedEncryptionPublicKeyMsgCount
    );
  },
);

export const currentCurrencySelector = (state) =>
  state.metamask.currentCurrency;
export const conversionRateSelector = (state, currency) =>
  state.metamask.rates[currency] || {
    conversionRate: 0,
    conversionUsdRate: 0,
  };

export const txDataSelector = (state) => state.confirmTransaction.txData;
const tokenDataSelector = (state) => state.confirmTransaction.tokenData;
const tokenPropsSelector = (state) => state.confirmTransaction.tokenProps;

const contractExchangeRatesSelector = (state) =>
  state.metamask.contractExchangeRates;

const tokenDecimalsSelector = createSelector(
  tokenPropsSelector,
  (tokenProps) => tokenProps && tokenProps.decimals,
);

const tokenDataArgsSelector = createSelector(
  tokenDataSelector,
  (tokenData) => (tokenData && tokenData.args) || [],
);

const txParamsSelector = createSelector(
  txDataSelector,
  (txData) => (txData && txData.txParams) || {},
);

export const tokenAddressSelector = createSelector(
  txParamsSelector,
  (txParams) => txParams && txParams.to,
);

const TOKEN_PARAM_TO = '_to';
const TOKEN_PARAM_VALUE = '_value';

export const sendTokenTokenAmountAndToAddressSelector = createSelector(
  tokenDataArgsSelector,
  tokenDecimalsSelector,
  (args, tokenDecimals) => {
    let toAddress = '';
    let tokenAmount = '0';

    // Token params here are ethers BigNumbers, which have a different
    // interface than bignumber.js
    if (args && args.length) {
      toAddress = args[TOKEN_PARAM_TO];
      let value = args[TOKEN_PARAM_VALUE].toString();

      if (tokenDecimals) {
        // bignumber.js return value
        value = calcTokenAmount(value, tokenDecimals).toFixed();
      }

      tokenAmount = roundExponential(value);
    }

    return {
      toAddress,
      tokenAmount,
    };
  },
);

export const contractExchangeRateSelector = createSelector(
  contractExchangeRatesSelector,
  tokenAddressSelector,
  (contractExchangeRates, tokenAddress) =>
    contractExchangeRates[
      Object.keys(contractExchangeRates).find((address) =>
        isEqualCaseInsensitive(address, tokenAddress),
      )
    ],
);

export const transactionFeeSelector = function (state, txData) {
  const { txParams: { value = '0x0', localId } = {} } = txData;
  const feeParams = {
    ...(txData.txParams?.feeParams || {}),
  };
  if (!localId) {
    return {
      gasEstimationObject: {},
    };
  }

  const assetInstance = new AssetModel(localId, {
    getState: () => state.metamask,
  });
  const { sharedProvider } = assetInstance;
  const nativeCurrency = sharedProvider.nativeToken.symbol;

  const currentCurrency = currentCurrencySelector(state);
  const { conversionRate } = conversionRateSelector(state, nativeCurrency);

  let hexMinimumTransactionFee;
  let hexMaximumTransactionFee;
  let hexTransactionTotal;
  let gasEstimationObject = {};

  if (sharedProvider.isEthTypeNetwork) {
    const gasFeeEstimates = getGasFeeEstimates(state) || {};
    const gasEstimateType = getGasEstimateType(state);
    const networkAndAccountSupportsEIP1559 = sharedProvider.eip1559support;

    gasEstimationObject = {
      gasLimit: txData.txParams?.gas ?? '0x0',
    };

    if (networkAndAccountSupportsEIP1559) {
      const { gasPrice = '0' } = gasFeeEstimates;
      const selectedGasEstimates = gasFeeEstimates[txData.userFeeLevel] || {};
      if (txData.txParams?.type === TransactionEnvelopeType.legacy) {
        gasEstimationObject.gasPrice =
          txData.txParams?.gasPrice ?? decGWEIToHexWEI(gasPrice);
      } else {
        const { suggestedMaxPriorityFeePerGas, suggestedMaxFeePerGas } =
          selectedGasEstimates;
        gasEstimationObject.maxFeePerGas =
          txData.txParams?.maxFeePerGas &&
          (txData.userFeeLevel === CUSTOM_GAS_ESTIMATE ||
            !suggestedMaxFeePerGas)
            ? txData.txParams?.maxFeePerGas
            : decGWEIToHexWEI(suggestedMaxFeePerGas || gasPrice);
        gasEstimationObject.maxPriorityFeePerGas =
          txData.txParams?.maxPriorityFeePerGas &&
          (txData.userFeeLevel === CUSTOM_GAS_ESTIMATE ||
            !suggestedMaxPriorityFeePerGas)
            ? txData.txParams?.maxPriorityFeePerGas
            : (suggestedMaxPriorityFeePerGas &&
                decGWEIToHexWEI(suggestedMaxPriorityFeePerGas)) ||
              gasEstimationObject.maxFeePerGas;
        gasEstimationObject.baseFeePerGas = decGWEIToHexWEI(
          gasFeeEstimates.estimatedBaseFee,
        );
      }
    } else {
      switch (gasEstimateType) {
        case GasEstimateTypes.none:
          gasEstimationObject.gasPrice = txData.txParams?.gasPrice ?? '0x0';
          break;
        case GasEstimateTypes.ethGasPrice:
          gasEstimationObject.gasPrice =
            txData.txParams?.gasPrice ??
            decGWEIToHexWEI(gasFeeEstimates.gasPrice);
          break;
        case GasEstimateTypes.legacy:
          gasEstimationObject.gasPrice =
            txData.txParams?.gasPrice ?? getAveragePriceEstimateInHexWEI(state);
          break;
        case GasEstimateTypes.feeMarket:
          break;
        default:
          break;
      }
    }

    hexMinimumTransactionFee = getMinimumGasTotalInHexWei(gasEstimationObject);
    hexMaximumTransactionFee = getMaximumGasTotalInHexWei(gasEstimationObject);
    hexTransactionTotal = sumHexes(value, hexMinimumTransactionFee);
  } else {
    hexTransactionTotal = sumHexes(value, feeParams.fee);
    hexMaximumTransactionFee = feeParams.feeLimit;
    hexMinimumTransactionFee = feeParams.fee;
  }

  const fiatTransactionAmount = getValueFromWeiHex({
    value,
    fromCurrency: nativeCurrency,
    toCurrency: currentCurrency,
    conversionRate,
    numberOfDecimals: 2,
  });
  const ethTransactionAmount = getValueFromWeiHex({
    value,
    fromCurrency: nativeCurrency,
    toCurrency: nativeCurrency,
    conversionRate,
    numberOfDecimals: 6,
  });
  const fiatMinimumTransactionFee = getTransactionFee({
    value: hexMinimumTransactionFee,
    fromCurrency: nativeCurrency,
    toCurrency: currentCurrency,
    numberOfDecimals: 2,
    conversionRate,
  });

  const fiatMaximumTransactionFee = getTransactionFee({
    value: hexMaximumTransactionFee,
    fromCurrency: nativeCurrency,
    toCurrency: currentCurrency,
    numberOfDecimals: 2,
    conversionRate,
  });

  const ethTransactionFee = getTransactionFee({
    value: hexMinimumTransactionFee,
    fromCurrency: nativeCurrency,
    toCurrency: nativeCurrency,
    numberOfDecimals: 6,
    conversionRate,
  });

  const fiatTransactionTotal = addFiat(
    fiatMinimumTransactionFee,
    fiatTransactionAmount,
  );
  const ethTransactionTotal = addEth(ethTransactionFee, ethTransactionAmount);

  return {
    hexTransactionAmount: value,
    fiatTransactionAmount,
    ethTransactionAmount,
    hexMinimumTransactionFee,
    fiatMinimumTransactionFee,
    hexMaximumTransactionFee,
    fiatMaximumTransactionFee,
    ethTransactionFee,
    fiatTransactionTotal,
    ethTransactionTotal,
    hexTransactionTotal,
    gasEstimationObject,

    bandwidth: feeParams.bandwidth,
    energy: feeParams.energy,
  };
};
