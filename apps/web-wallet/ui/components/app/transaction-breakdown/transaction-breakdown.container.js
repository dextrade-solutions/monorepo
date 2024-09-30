import { connect } from 'react-redux';
import {
  getShouldShowFiat,
  getIsMultiLayerFeeNetwork,
  assetModel,
} from '../../../selectors';
import { getHexGasTotal } from '../../../helpers/utils/confirm-tx.util';
import { isEIP1559Transaction } from '../../../../shared/modules/transaction.utils';

import {
  subtractHexes,
  sumHexes,
} from '../../../../shared/modules/conversion.utils';
import TransactionBreakdown from './transaction-breakdown.component';

const mapStateToProps = (state, ownProps) => {
  const { transaction, isTokenApprove } = ownProps;
  const {
    txParams: { gas, gasPrice, maxFeePerGas, localId, value } = {},
    txReceipt: { effectiveGasPrice, feeUsed, l1Fee: l1HexGasTotal } = {},
    baseFeePerGas,
  } = transaction;

  const assetInstance = localId ? assetModel(state, localId) : null;
  const gasLimit = typeof feeUsed === 'string' ? feeUsed : gas;

  const priorityFee =
    effectiveGasPrice &&
    baseFeePerGas &&
    subtractHexes(effectiveGasPrice, baseFeePerGas);

  // To calculate the total cost of the transaction, we use gasPrice if it is in the txParam,
  // which will only be the case on non-EIP1559 networks. If it is not in the params, we can
  // use the effectiveGasPrice from the receipt, which will ultimately represent to true cost
  // of the transaction. Either of these are used the same way with gasLimit to calculate total
  // cost. effectiveGasPrice will be available on the txReciept for all EIP1559 networks
  const usedGasPrice = gasPrice || effectiveGasPrice;
  const hexGasTotal =
    (gasLimit &&
      usedGasPrice &&
      getHexGasTotal({ gasLimit, gasPrice: usedGasPrice })) ||
    '0x0';
  let totalInHex;
  let isMultiLayerFeeNetwork;
  if (assetInstance.sharedProvider.isEthTypeNetwork) {
    totalInHex = sumHexes(hexGasTotal, value);

    // TODO: Check is MultiLayerFeeNetwork
    isMultiLayerFeeNetwork = false && l1HexGasTotal !== undefined;

    if (isMultiLayerFeeNetwork) {
      totalInHex = sumHexes(totalInHex, l1HexGasTotal);
    }
  } else {
    totalInHex = sumHexes(feeUsed, value);
  }

  return {
    showFiat: getShouldShowFiat(state),
    gas,
    gasPrice,
    maxFeePerGas,
    feeUsed,
    isTokenApprove,
    baseFee: baseFeePerGas,
    isEIP1559Transaction: isEIP1559Transaction(transaction),
    l1HexGasTotal,
    transaction,
    assetInstance,

    totalInHex,
    hexGasTotal,
    priorityFee,
    isMultiLayerFeeNetwork,
  };
};

export default connect(mapStateToProps)(TransactionBreakdown);
