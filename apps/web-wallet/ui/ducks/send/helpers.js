import { addHexPrefix } from 'ethereumjs-util';
import abi from 'human-standard-token-abi';
import BigNumber from 'bignumber.js';
import { GAS_LIMITS, MIN_GAS_LIMIT_HEX } from '../../../shared/constants/gas';
import { calcTokenAmount } from '../../../shared/lib/transactions-controller-utils';
import { CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP } from '../../../shared/constants/network';
import {
  AssetType,
  TransactionEnvelopeType,
} from '../../../shared/constants/transaction';

import {
  addGasBuffer,
  generateERC721TransferData,
} from '../../pages/send/send.utils';
import { getGasPriceInHexWei } from '../../selectors';
import { Numeric } from '../../../shared/modules/Numeric';
import { getSharedProvider } from '../../../shared/shared-chain-provider';

// Only works for eth type chains
export async function estimateGasLimitForSend({
  selectedAddress,
  value,
  gasPrice,
  assetInstance,
  to,
  data,
  gasLimit,
  ...options
}) {
  if (!assetInstance.sharedProvider.isEthTypeNetwork) {
    throw new Error('estimateGasLimitForSend - Is not eth type network');
  }
  // TODO: Need refactor in dextrade
  const isSimpleSendOnNonStandardNetwork = false;

  // blockGasLimit may be a falsy, but defined, value when we receive it from
  // state, so we use logical or to fall back to MIN_GAS_LIMIT_HEX. Some
  // network implementations check the gas parameter supplied to
  // eth_estimateGas for validity. For this reason, we set token sends
  // blockGasLimit default to a higher number. Note that the current gasLimit
  // on a BLOCK is 15,000,000 and will be 30,000,000 on mainnet after London.
  // Meanwhile, MIN_GAS_LIMIT_HEX is 0x5208.
  let blockGasLimit = MIN_GAS_LIMIT_HEX;
  if (options.blockGasLimit) {
    blockGasLimit = options.blockGasLimit;
  } else if (assetInstance.contract) {
    blockGasLimit = GAS_LIMITS.BASE_TOKEN_ESTIMATE;
  }

  // The parameters below will be sent to our background process to estimate
  // how much gas will be used for a transaction. That background process is
  // located in tx-gas-utils.js in the transaction controller folder.
  const paramsForGasEstimate = { from: selectedAddress, value, gasPrice };

  if (assetInstance.contract) {
    if (!to) {
      // If no to address is provided, we cannot generate the token transfer
      // hexData. hexData in a transaction largely dictates how much gas will
      // be consumed by a transaction. We must use our best guess, which is
      // represented in the gas shared constants.
      return GAS_LIMITS.BASE_TOKEN_ESTIMATE;
    }
    paramsForGasEstimate.value = '0x0';

    // We have to generate the erc20/erc721 contract call to transfer tokens in
    // order to get a proper estimate for gasLimit.
    paramsForGasEstimate.data =
      assetInstance.sharedProvider.generateTokenTransferData({
        fromAddress: selectedAddress,
        toAddress: to,
        amount: value,
      });

    paramsForGasEstimate.to = assetInstance.contract;
  } else {
    if (!data) {
      return GAS_LIMITS.SIMPLE;
    }

    paramsForGasEstimate.data = data;

    if (to) {
      paramsForGasEstimate.to = to;
    }

    if (!value || value === '0') {
      // TODO: Figure out what's going on here. According to eth_estimateGas
      // docs this value can be zero, or undefined, yet we are setting it to a
      // value here when the value is undefined or zero. For more context:
      // https://github.com/MetaMask/metamask-extension/pull/6195
      paramsForGasEstimate.value = '0xff';
    }
  }

  if (!isSimpleSendOnNonStandardNetwork) {
    // If we do not yet have a gasLimit, we must call into our background
    // process to get an estimate for gasLimit based on known parameters.
    paramsForGasEstimate.gas = new Numeric(blockGasLimit, 16)
      .times(new Numeric(0.95, 10))
      .round(0, BigNumber.ROUND_DOWN)
      .toPrefixedHexString();
  }

  // The buffer multipler reduces transaction failures by ensuring that the
  // estimated gas is always sufficient. Without the multiplier, estimates
  // for contract interactions can become inaccurate over time. This is because
  // gas estimation is non-deterministic. The gas required for the exact same
  // transaction call can change based on state of a contract or changes in the
  // contracts environment (blockchain data or contracts it interacts with).
  // Applying the 1.5 buffer has proven to be a useful guard against this non-
  // deterministic behaviour.
  //
  // Gas estimation of simple sends should, however, be deterministic. As such
  // no buffer is needed in those cases.
  let bufferMultiplier = 1.5;
  if (isSimpleSendOnNonStandardNetwork) {
    bufferMultiplier = 1;
  } else if (CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP[assetInstance.chainId]) {
    bufferMultiplier = CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP[assetInstance.chainId];
  }

  try {
    // Call into the background process that will simulate transaction
    // execution on the node and return an estimate of gasLimit
    const query = assetInstance.sharedProvider.client;
    const estimatedGasLimit = await new Promise((resolve, reject) => {
      return query.estimateGas(paramsForGasEstimate, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    });
    const estimateWithBuffer = addGasBuffer(
      estimatedGasLimit.toString(16),
      blockGasLimit,
      bufferMultiplier,
    );
    return addHexPrefix(estimateWithBuffer);
  } catch (error) {
    console.error(error);
    const simulationFailed =
      error.message.includes('Transaction execution error.') ||
      error.message.includes(
        'gas required exceeds allowance or always failing transaction',
      ) ||
      (CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP[assetInstance.chainId] &&
        error.message.includes('gas required exceeds allowance'));
    if (simulationFailed) {
      const estimateWithBuffer = addGasBuffer(
        paramsForGasEstimate?.gas ?? gasLimit,
        blockGasLimit,
        bufferMultiplier,
      );
      return addHexPrefix(estimateWithBuffer);
    }
    throw error;
  }
}

/**
 * Generates a txParams from the send slice.
 *
 * @param {import('.').SendState} sendState - the state of the send slice
 * @returns {import(
 *  '../../../shared/constants/transaction'
 * ).TxParams} A txParams object that can be used to create a transaction or
 *  update an existing transaction.
 */
export function generateTransactionParams(sendState) {
  // const state = thunkApi.getState();
  const draftTransaction =
    sendState.draftTransactions[sendState.currentTransactionUUID];
  const sharedProvider = getSharedProvider(
    draftTransaction.networkConfiguration,
  );
  const txParams = {
    from: draftTransaction.asset.account,
    // gasLimit always needs to be set regardless of the asset being sent
    // or the type of transaction.
    gas: draftTransaction.gas.gasLimit,
    localId: draftTransaction.asset.localId,
  };
  switch (draftTransaction.asset.type) {
    case AssetType.token:
      // When sending a token the to address is the contract address of
      // the token being sent. The value is set to '0x0' and the data
      // is generated from the recipient address, token being sent and
      // amount.
      txParams.to = draftTransaction.asset.address;
      txParams.value = '0x0';
      txParams.data = sharedProvider.generateTokenTransferData({
        toAddress: draftTransaction.recipient.address,
        amount: draftTransaction.amount.value,
        sendToken: draftTransaction.asset,
      });
      break;
    case AssetType.NFT:
      // When sending a token the to address is the contract address of
      // the token being sent. The value is set to '0x0' and the data
      // is generated from the recipient address, token being sent and
      // amount.
      txParams.to = draftTransaction.asset.address;
      txParams.value = '0x0';
      txParams.data = generateERC721TransferData({
        toAddress: draftTransaction.recipient.address,
        fromAddress:
          draftTransaction.fromAccount?.address ??
          sendState.selectedAccount.address,
        tokenId: draftTransaction.asset.tokenId,
      });
      break;
    case AssetType.native:
    default:
      // When sending native currency the to and value fields use the
      // recipient and amount values and the data key is either null or
      // populated with the user input provided in hex field.
      txParams.to = draftTransaction.recipient.address;
      txParams.value = draftTransaction.amount.value;
      txParams.data = draftTransaction.userInputHexData ?? undefined;
  }

  // We need to make sure that we only include the right gas fee fields
  // based on the type of transaction the network supports. We will also set
  // the type param here.
  if (sendState.eip1559support) {
    txParams.type = TransactionEnvelopeType.feeMarket;

    txParams.maxFeePerGas = draftTransaction.gas.maxFeePerGas;
    txParams.maxPriorityFeePerGas = draftTransaction.gas.maxPriorityFeePerGas;

    if (!txParams.maxFeePerGas || txParams.maxFeePerGas === '0x0') {
      txParams.maxFeePerGas = draftTransaction.gas.gasPrice;
    }

    if (
      !txParams.maxPriorityFeePerGas ||
      txParams.maxPriorityFeePerGas === '0x0'
    ) {
      txParams.maxPriorityFeePerGas = txParams.maxFeePerGas;
    }
  } else {
    txParams.gasPrice = draftTransaction.gas.gasPrice;
    txParams.type = TransactionEnvelopeType.legacy;
  }

  return txParams;
}

/**
 * This method is used to keep the original logic from the gas.duck.js file
 * after receiving a gasPrice from eth_gasPrice. First, the returned gasPrice
 * was converted to GWEI, then it was converted to a Number, then in the send
 * duck (here) we would use getGasPriceInHexWei to get back to hexWei. Now that
 * we receive a GWEI estimate from the controller, we still need to do this
 * weird conversion to get the proper rounding.
 *
 * @param {string} gasPriceEstimate
 * @returns {string}
 */
export function getRoundedGasPrice(gasPriceEstimate) {
  const gasPriceInDecGwei = new Numeric(gasPriceEstimate, 10)
    .round(9)
    .toString();
  const gasPriceAsNumber = Number(gasPriceInDecGwei);
  return getGasPriceInHexWei(gasPriceAsNumber);
}

export async function getERC20Balance(token, accountAddress) {
  const contract = global.eth.contract(abi).at(token.address);
  const usersToken = (await contract.balanceOf(accountAddress)) ?? null;
  if (!usersToken) {
    return '0x0';
  }
  const amount = calcTokenAmount(
    usersToken.balance.toString(),
    token.decimals,
  ).toString(16);
  return addHexPrefix(amount);
}
