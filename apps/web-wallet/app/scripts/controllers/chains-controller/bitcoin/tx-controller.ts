import bitcore from 'bitcore-lib';
import { addHexPrefix } from 'ethereumjs-util';
import { memoize } from 'lodash';
import { ObservableStore } from '@metamask/obs-store';
import GetblockServiceApi from '../../../services/getblock-service';
import BlockchainInfoService from '../../../services/blockchaininfo-service';
import {
  ControllerState,
  TxParams,
  FeeParams,
  EnqueueWithCooldown,
} from '../types';
import { GasEstimateTypes } from '../../../../../shared/constants/gas';

import { BlockChainInfoUnspentOutputs } from './types';

const DEFAULT_FEE_PER_BYTE = 22;

export default class TxController {
  private store: ObservableStore<ControllerState>;

  private getblockService: GetblockServiceApi;

  private getCurrentAccountKeys: () => Promise<{
    privateKey: string;
    hdKey: any;
  }>;

  private updateAccount: () => Promise<void>;

  private enqueueWithCooldown: EnqueueWithCooldown;

  private blockchainInfoService: BlockchainInfoService;

  private getUnspentOutputs: (
    account: string,
  ) => Promise<BlockChainInfoUnspentOutputs>;

  constructor({
    store,
    getblockService,
    blockchainInfoService,
    getCurrentAccountKeys,
    updateAccount,
    enqueueWithCooldown,
  }: {
    store: ObservableStore<ControllerState>;
    getblockService: GetblockServiceApi;
    getCurrentAccountKeys: () => Promise<{
      privateKey: string;
      hdKey: any;
    }>;
    updateAccount: () => Promise<void>;
    enqueueWithCooldown: EnqueueWithCooldown;
    blockchainInfoService: BlockchainInfoService;
  }) {
    this.store = store;
    this.getCurrentAccountKeys = getCurrentAccountKeys;
    this.updateAccount = updateAccount;
    this.enqueueWithCooldown = enqueueWithCooldown;
    this.getblockService = getblockService;
    this.blockchainInfoService = blockchainInfoService;

    this.getUnspentOutputs = memoize((account) =>
      this.enqueueWithCooldown(() => {
        return this.blockchainInfoService.getUnspentOutputs(account);
      }),
    );
  }

  /** You can run this function to check bitcore-lib. TODO: Move to somewhere other place */
  _buildTestTx() {
    const from = bitcore.Address.fromString(
      'mi5q3MkaDXmxJ12Jxg42fPB4BbrqoN5Xid',
    );
    const to = bitcore.Address.fromString('myvckehMePtDJJKMpu4KCskGzFALDbZGpE');
    const privateKey =
      '8ef2d69bed77d97155f3b287dd4e7a0bab419f0f770d92a883d684c628c71ed2';
    const utxos = [
      new bitcore.Transaction.UnspentOutput({
        txId: 'a024aacf85de6924ab654c314622d03b021764345218bbae91a7a2fb80160638',
        outputIndex: 1,
        address: from,
        script: bitcore.Script.buildPublicKeyHashOut(from),
        satoshis: 441882,
      }),
    ];
    const feePerByte = DEFAULT_FEE_PER_BYTE;

    const transaction = new bitcore.Transaction();
    transaction
      .from(utxos)
      .to(to, 5500)
      .change(from)
      .feePerKb(feePerByte)
      .fee(transaction.getFee());

    transaction.sign(privateKey);
    const transactionString = transaction.serialize();
    if (!transactionString) {
      throw new Error(
        'Test have been failed, something is wrong with bitcore-lib',
      );
    }
    console.info(transactionString);
    return transactionString;
  }

  broadcast(hexstring: string) {
    return this.getblockService.broadcastTransaction(hexstring);
  }

  async approveTransaction(txMeta: any) {
    const { txParams } = txMeta;
    const txHash = await this.simpleSend(txParams);
    this.updateAccount();
    return txHash;
  }

  fetchGasFeeEstimateData() {
    // temporary solution
    return {
      gasFeeEstimates: {},
      gasEstimateType: GasEstimateTypes.tron,
    };
  }

  async addTxFeeDefaults(txMeta: any) {
    const feeParams = await this.getFee(txMeta.txParams);
    const hexedFeeParams = Object.entries(feeParams).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: addHexPrefix(value.toString(16)),
      }),
      {},
    );
    txMeta.txParams.feeParams = hexedFeeParams;
    return txMeta;
  }

  async getFee(txParams: TxParams): Promise<FeeParams> {
    const tx = await this._buildTransaction(txParams);
    const fee = tx.getFee();
    return {
      fee,
      feeLimit: fee,
    };
  }

  async simpleSend(txParams: TxParams) {
    const tx = await this._buildTransaction(txParams);
    const { privateKey } = await this.getCurrentAccountKeys();
    tx.sign(privateKey);
    const transactionString = tx.serialize();

    const response = await this.broadcast(transactionString);
    this.getUnspentOutputs.cache.clear();
    return response.result;
  }

  getFeePerKb() {
    const { network } = this.store.getState();
    if (
      !network.highFeePerKb ||
      !network.mediumFeePerKb ||
      !network.lowFeePerKb
    ) {
      throw new Error('No network info available');
    }
    return network.mediumFeePerKb;
  }

  async _buildTransaction(txParams: TxParams): Promise<bitcore.Transaction> {
    const from = bitcore.Address.fromString(txParams.from);
    const to = bitcore.Address.fromString(txParams.to);
    const result = await this.getUnspentOutputs(txParams.from);

    const value = parseInt(txParams.value, 16);
    const unspentTxs = result.unspent_outputs || [];

    const utxos = unspentTxs.map((utxo) => {
      return new bitcore.Transaction.UnspentOutput({
        txId: utxo.tx_hash,
        outputIndex: utxo.tx_output_n,
        address: from,
        script: utxo.script || bitcore.Script.buildPublicKeyHashOut(from),
        satoshis: utxo.value,
      });
    });

    let feePerByte = this.getFeePerKb();
    if (!feePerByte) {
      feePerByte = DEFAULT_FEE_PER_BYTE;
    }

    const transaction = new bitcore.Transaction();
    return transaction
      .from(utxos)
      .to(to, value)
      .change(from)
      .feePerKb(feePerByte)
      .fee(transaction.getFee());
  }
}
