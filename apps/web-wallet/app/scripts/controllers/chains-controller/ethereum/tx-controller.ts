import {
  bufferToHex,
  keccak,
  toBuffer,
  addHexPrefix,
  isHexString,
} from 'ethereumjs-util';
import { TransactionFactory } from '@ethereumjs/tx';
import Common, { Hardfork } from '@ethereumjs/common';
import { KeyringController } from '@metamask/eth-keyring-controller';
import {
  CUSTOM_GAS_ESTIMATE,
  GAS_LIMITS,
  GasEstimateTypes,
  GasRecommendations,
  PriorityLevels,
} from '../../../../../shared/constants/gas';
import {
  TransactionEnvelopeType,
  TransactionType,
} from '../../../../../shared/constants/transaction';

import {
  fetchGasEstimates,
  fetchLegacyGasPriceEstimates,
  fetchEthGasPriceEstimate,
  calculateTimeEstimate,
} from '../../../../overrided-metamask/gas-fee-controller/gas-util';

import { SWAP_TRANSACTION_TYPES } from '../../../../../shared/lib/transactions-controller-utils';
import { decGWEIToHexWEI } from '../../../../../shared/modules/conversion.utils';
import { ORIGIN_METAMASK } from '../../../../overrided-metamask/controller-utils';
import PreferencesController from '../../preferences';
import { getChainType } from '../../../lib/util';
import {
  CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP,
  HARDFORKS,
  NETWORK_TYPES,
} from '../../../../../shared/constants/network';
import { ChainId } from '../types';
import {
  GAS_API_BASE_URL,
  SWAPS_CLIENT_ID,
} from '../../../../../shared/constants/swaps';
import { isEIP1559Transaction } from '../../../../../shared/modules/transaction.utils';
import { generateERC20TransferData } from '../../../../../ui/pages/send/send.utils';
import {
  getMaximumGasTotalInHexWei,
  getMinimumGasTotalInHexWei,
} from '../../../../../shared/modules/gas.utils';
import TxGasUtil from './tx-gas-utils';
import determineGasFeeCalculations from './determineGasFeeCalculations';
import fetchGasEstimatesViaEthFeeHistory from './fetchGasEstimatesViaEthFeeHistory';

export default class TxController {
  private ethQuery;

  private eip1559support: boolean;

  private preferencesController: PreferencesController;

  private keyringController: KeyringController;

  private chainId: ChainId;

  private legacyAPIEndpoint: string;

  private EIP1559APIEndpoint: string;

  txGasUtil: TxGasUtil;

  constructor({
    ethQuery,
    eip1559support,
    preferencesController,
    chainId,
    keyringController,
  }: {
    ethQuery: any;
    eip1559support: boolean;
    preferencesController: PreferencesController;
    keyringController: KeyringController;
    chainId: ChainId;
  }) {
    this.eip1559support = eip1559support;
    this.ethQuery = ethQuery;
    this.preferencesController = preferencesController;
    this.keyringController = keyringController;
    this.chainId = chainId;

    this.txGasUtil = new TxGasUtil();

    this.legacyAPIEndpoint = `${GAS_API_BASE_URL}/networks/<chain_id>/gasPrices`;
    this.EIP1559APIEndpoint = `${GAS_API_BASE_URL}/networks/<chain_id>/suggestedGasFees`;
  }

  generateTokenTransferData(transferParams: any) {
    return generateERC20TransferData(transferParams);
  }

  /**
   * `@ethereumjs/tx` uses `@ethereumjs/common` as a configuration tool for
   * specifying which chain, network, hardfork and EIPs to support for
   * a transaction. By referencing this configuration, and analyzing the fields
   * specified in txParams, `@ethereumjs/tx` is able to determine which EIP-2718
   * transaction type to use.
   *
   * @returns common configuration object
   */
  async getCommonConfiguration(): Promise<Common> {
    const { chainId } = this;
    const supportsEIP1559 = this.eip1559support;

    const type = chainId === '0x1' ? 'mainnet' : 'rpc';

    // This logic below will have to be updated each time a hardfork happens
    // that carries with it a new Transaction type. It is inconsequential for
    // hardforks that do not include new types.
    const hardfork = supportsEIP1559 ? HARDFORKS.LONDON : HARDFORKS.BERLIN;

    // type will be one of our default network names or 'rpc'. the default
    // network names are sufficient configuration, simply pass the name as the
    // chain argument in the constructor.
    if (type !== NETWORK_TYPES.RPC) {
      return new Common({
        chain: type,
        hardfork,
      });
    }

    const customChainParams = {
      chainId: parseInt(chainId, 16),
      defaultHardfork: Hardfork.London,
    };

    return Common.custom(customChainParams);
  }

  /**
   * publishes the raw tx and sets the txMeta to submitted
   *
   * @param txMeta - the tx's Id
   * @param rawTx - the hex string of the serialized signed transaction
   * @returns txHash
   */
  async publishEthTransaction(txMeta: any, rawTx: string): Promise<string> {
    txMeta.rawTx = rawTx;
    if (txMeta.type === TransactionType.swap) {
      const preTxBalance = await this.ethQuery.getBalance(txMeta.txParams.from);
      txMeta.preTxBalance = preTxBalance.toString(16);
    }

    let txHash;
    try {
      txHash = await this.ethQuery.sendRawTransaction(rawTx);
    } catch (error: any) {
      if (error.message.toLowerCase().includes('known transaction')) {
        txHash = keccak(toBuffer(addHexPrefix(rawTx))).toString('hex');
        txHash = addHexPrefix(txHash);
      } else {
        throw error;
      }
    }
    return txHash;
  }

  /**
   * adds the chain id and signs the transaction and set the status to signed
   *
   * @param txMeta
   * @returns rawTx
   */
  async signTransaction(txMeta: any) {
    const type = isEIP1559Transaction(txMeta)
      ? TransactionEnvelopeType.feeMarket
      : TransactionEnvelopeType.legacy;
    const txParams = {
      type,
      chainId: this.chainId,
      value: txMeta.txParams.value,
      from: txMeta.txParams.from,
      data: txMeta.txParams.data,
      to: txMeta.txParams.to,
      nonce: txMeta.txParams.nonce,
      gas: txMeta.txParams.gas,
      gasLimit: txMeta.txParams.gas,
      gasPrice: txMeta.txParams.gasPrice,
      maxFeePerGas: txMeta.txParams.maxFeePerGas,
      maxPriorityFeePerGas: txMeta.txParams.maxPriorityFeePerGas,
    };
    // sign tx
    const fromAddress = txParams.from;
    const common = await this.getCommonConfiguration();
    const unsignedEthTx = TransactionFactory.fromTxData(txParams, {
      common,
    });
    const signedEthTx = await this.keyringController.signTransaction(
      unsignedEthTx,
      fromAddress,
    );

    // add r,s,v values for provider request purposes see createMetamaskMiddleware
    // and JSON rpc standard for further explanation
    txMeta.r = bufferToHex(signedEthTx.r);
    txMeta.s = bufferToHex(signedEthTx.s);
    txMeta.v = bufferToHex(signedEthTx.v);
    const rawTx = bufferToHex(signedEthTx.serialize());
    return rawTx;
  }

  async approveTransaction(txMeta: any) {
    const nonce = await this.ethQuery.getTransactionCount(txMeta.txParams.from);
    txMeta.txParams.nonce = addHexPrefix(nonce.toString(16));
    // sign transaction
    const rawTx = await this.signTransaction(txMeta);
    const txHash = await this.publishEthTransaction(txMeta, rawTx);
    return txHash;
  }

  /**
   * Gets and sets gasFeeEstimates in state.
   *
   * @returns The gas fee estimates.
   */
  async fetchGasFeeEstimateData(): Promise<any | null> {
    const currentChainId = this.chainId;
    const isEIP1559Compatible = this.eip1559support;
    const isLegacyGasAPICompatible = true;
    let chainId: number;
    if (typeof currentChainId === 'string') {
      if (isHexString(currentChainId)) {
        chainId = parseInt(currentChainId, 16);
      } else {
        chainId = parseInt(currentChainId, 10);
      }
    } else {
      chainId = currentChainId;
    }
    const gasFeeCalculations = await determineGasFeeCalculations({
      isEIP1559Compatible,
      isLegacyGasAPICompatible,
      fetchGasEstimates,
      fetchGasEstimatesUrl: this.EIP1559APIEndpoint.replace(
        '<chain_id>',
        `${chainId}`,
      ),
      fetchGasEstimatesViaEthFeeHistory,
      fetchLegacyGasPriceEstimates,
      fetchLegacyGasPriceEstimatesUrl: this.legacyAPIEndpoint.replace(
        '<chain_id>',
        `${chainId}`,
      ),
      fetchEthGasPriceEstimate,
      calculateTimeEstimate,
      clientId: SWAPS_CLIENT_ID,
      ethQuery: this.ethQuery,
    });
    return gasFeeCalculations;
  }

  /**
   * Gets default gas fees, or returns `undefined` if gas fees are already set
   *
   * @param txMeta - The txMeta object
   * @param eip1559Compatibility
   * @returns The default gas price
   */
  private async getDefaultGasFees(txMeta: any, eip1559Compatibility: boolean) {
    if (
      (!eip1559Compatibility && txMeta.txParams.gasPrice) ||
      (eip1559Compatibility &&
        txMeta.txParams.maxFeePerGas &&
        txMeta.txParams.maxPriorityFeePerGas)
    ) {
      return {};
    }

    try {
      const { gasFeeEstimates, gasEstimateType } =
        await this.fetchGasFeeEstimateData();
      if (
        eip1559Compatibility &&
        gasEstimateType === GasEstimateTypes.feeMarket
      ) {
        const {
          medium: { suggestedMaxPriorityFeePerGas, suggestedMaxFeePerGas } = {
            suggestedMaxPriorityFeePerGas: null,
            suggestedMaxFeePerGas: null,
          },
        } = gasFeeEstimates;
        if (suggestedMaxPriorityFeePerGas && suggestedMaxFeePerGas) {
          return {
            maxFeePerGas: decGWEIToHexWEI(suggestedMaxFeePerGas),
            maxPriorityFeePerGas: decGWEIToHexWEI(
              suggestedMaxPriorityFeePerGas,
            ),
          };
        }
      } else if (gasEstimateType === GasEstimateTypes.legacy) {
        // The LEGACY type includes low, medium and high estimates of
        // gas price values.
        return {
          gasPrice: decGWEIToHexWEI(gasFeeEstimates.medium),
        };
      } else if (gasEstimateType === GasEstimateTypes.ethGasPrice) {
        // The ETH_GASPRICE type just includes a single gas price property,
        // which we can assume was retrieved from eth_gasPrice
        return {
          gasPrice: decGWEIToHexWEI(gasFeeEstimates.gasPrice),
        };
      }
    } catch (e) {
      console.error(e);
    }
    const gasPrice = await this.ethQuery.gasPrice();

    return { gasPrice: gasPrice && addHexPrefix(gasPrice.toString(16)) };
  }

  /**
   * Gets default gas limit, or debug information about why gas estimate failed.
   *
   * @param txMeta - The txMeta object
   * @returns Object containing the default gas limit, or the simulation failure object
   */
  private async getDefaultGasLimit(txMeta: any) {
    const customNetworkGasBuffer =
      CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP[this.chainId];
    const chainType = getChainType(this.chainId);

    if (txMeta.txParams.gas) {
      return {};
    } else if (
      txMeta.txParams.to &&
      txMeta.type === TransactionType.simpleSend &&
      chainType !== 'custom' &&
      !txMeta.txParams.data
    ) {
      // This is a standard ether simple send, gas requirement is exactly 21k
      return { gasLimit: GAS_LIMITS.SIMPLE };
    }
    const { blockGasLimit, estimatedGasHex, simulationFails } =
      await this.txGasUtil.analyzeGasUsage(txMeta, this.ethQuery);

    const estimatedGas = addHexPrefix(estimatedGasHex.toString());

    // add additional gas buffer to our estimation for safety
    const gasLimit = this.txGasUtil.addGasBuffer(
      estimatedGas,
      blockGasLimit,
      customNetworkGasBuffer,
    );

    return {
      gasLimit,
      estimatedGas,
      simulationFails,
    };
  }

  async addTxFeeDefaults(txMeta: any) {
    const eip1559Compatibility =
      txMeta.txParams.type !== TransactionEnvelopeType.legacy &&
      this.eip1559support;
    const {
      gasPrice: defaultGasPrice,
      maxFeePerGas: defaultMaxFeePerGas,
      maxPriorityFeePerGas: defaultMaxPriorityFeePerGas,
    } = await this.getDefaultGasFees(txMeta, eip1559Compatibility);
    const {
      gasLimit: defaultGasLimit,
      estimatedGas,
      simulationFails,
    } = await this.getDefaultGasLimit(txMeta);
    if (simulationFails) {
      txMeta.simulationFails = simulationFails;
    }

    if (eip1559Compatibility) {
      const advancedGasFeeDefaultValues =
        this.preferencesController.store.getState().advancedGasFee;
      if (
        Boolean(advancedGasFeeDefaultValues) &&
        !SWAP_TRANSACTION_TYPES.includes(txMeta.type)
      ) {
        txMeta.userFeeLevel = CUSTOM_GAS_ESTIMATE;
        txMeta.txParams.maxFeePerGas = decGWEIToHexWEI(
          advancedGasFeeDefaultValues.maxBaseFee,
        );
        txMeta.txParams.maxPriorityFeePerGas = decGWEIToHexWEI(
          advancedGasFeeDefaultValues.priorityFee,
        );
      } else if (
        txMeta.txParams.gasPrice &&
        !txMeta.txParams.maxFeePerGas &&
        !txMeta.txParams.maxPriorityFeePerGas
      ) {
        // If the dapp has suggested a gas price, but no maxFeePerGas or maxPriorityFeePerGas
        //  then we set maxFeePerGas and maxPriorityFeePerGas to the suggested gasPrice.
        txMeta.txParams.maxFeePerGas = txMeta.txParams.gasPrice;
        txMeta.txParams.maxPriorityFeePerGas = txMeta.txParams.gasPrice;
        if (txMeta.origin === ORIGIN_METAMASK) {
          txMeta.userFeeLevel = CUSTOM_GAS_ESTIMATE;
        } else {
          txMeta.userFeeLevel = PriorityLevels.dAppSuggested;
        }
      } else {
        if (
          (defaultMaxFeePerGas &&
            defaultMaxPriorityFeePerGas &&
            !txMeta.txParams.maxFeePerGas &&
            !txMeta.txParams.maxPriorityFeePerGas) ||
          txMeta.origin === ORIGIN_METAMASK
        ) {
          txMeta.userFeeLevel = GasRecommendations.medium;
        } else {
          txMeta.userFeeLevel = PriorityLevels.dAppSuggested;
        }

        if (defaultMaxFeePerGas && !txMeta.txParams.maxFeePerGas) {
          // If the dapp has not set the gasPrice or the maxFeePerGas, then we set maxFeePerGas
          // with the one returned by the gasFeeController, if that is available.
          txMeta.txParams.maxFeePerGas = defaultMaxFeePerGas;
        }

        if (
          defaultMaxPriorityFeePerGas &&
          !txMeta.txParams.maxPriorityFeePerGas
        ) {
          // If the dapp has not set the gasPrice or the maxPriorityFeePerGas, then we set maxPriorityFeePerGas
          // with the one returned by the gasFeeController, if that is available.
          txMeta.txParams.maxPriorityFeePerGas = defaultMaxPriorityFeePerGas;
        }

        if (defaultGasPrice && !txMeta.txParams.maxFeePerGas) {
          // If the dapp has not set the gasPrice or the maxFeePerGas, and no maxFeePerGas is available
          // from the gasFeeController, then we set maxFeePerGas to the defaultGasPrice, assuming it is
          // available.
          txMeta.txParams.maxFeePerGas = defaultGasPrice;
        }

        if (
          txMeta.txParams.maxFeePerGas &&
          !txMeta.txParams.maxPriorityFeePerGas
        ) {
          // If the dapp has not set the gasPrice or the maxPriorityFeePerGas, and no maxPriorityFeePerGas is
          // available from the gasFeeController, then we set maxPriorityFeePerGas to
          // txMeta.txParams.maxFeePerGas, which will either be the gasPrice from the controller, the maxFeePerGas
          // set by the dapp, or the maxFeePerGas from the controller.
          txMeta.txParams.maxPriorityFeePerGas = txMeta.txParams.maxFeePerGas;
        }
      }

      // We remove the gasPrice param entirely when on an eip1559 compatible network

      delete txMeta.txParams.gasPrice;
    } else {
      // We ensure that maxFeePerGas and maxPriorityFeePerGas are not in the transaction params
      // when not on a EIP1559 compatible network
      delete txMeta.txParams.maxPriorityFeePerGas;
      delete txMeta.txParams.maxFeePerGas;
    }

    // If we have gotten to this point, and none of gasPrice, maxPriorityFeePerGas or maxFeePerGas are
    // set on txParams, it means that either we are on a non-EIP1559 network and the dapp didn't suggest
    // a gas price, or we are on an EIP1559 network, and none of gasPrice, maxPriorityFeePerGas or maxFeePerGas
    // were available from either the dapp or the network.
    if (
      defaultGasPrice &&
      !txMeta.txParams.gasPrice &&
      !txMeta.txParams.maxPriorityFeePerGas &&
      !txMeta.txParams.maxFeePerGas
    ) {
      txMeta.txParams.gasPrice = defaultGasPrice;
    }

    if (defaultGasLimit && !txMeta.txParams.gas) {
      txMeta.txParams.gas = defaultGasLimit;
      txMeta.originalGasEstimate = defaultGasLimit;
    }
    txMeta.defaultGasEstimates = {
      estimateType: txMeta.userFeeLevel,
      gas: txMeta.txParams.gas,
      gasPrice: txMeta.txParams.gasPrice,
      maxFeePerGas: txMeta.txParams.maxFeePerGas,
      maxPriorityFeePerGas: txMeta.txParams.maxPriorityFeePerGas,
    };

    const gasTotal = getMaximumGasTotalInHexWei({
      gasLimit: estimatedGas,
      gasPrice: txMeta.txParams.gasPrice,
      maxFeePerGas: txMeta.txParams.maxFeePerGas,
    });

    txMeta.txParams.feeParams = {
      fee: gasTotal,
      feeLimit: gasTotal,
    };
    return txMeta;
  }
}
