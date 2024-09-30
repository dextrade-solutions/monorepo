import { Buffer } from 'buffer';
import TronWeb from 'tronweb-fetch/dist/TronWeb';

import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { hexToBN } from '@metamask/controller-utils';
import { TxParams } from '../../../../../shared/constants/transaction';

import { EnqueueWithCooldown, FeeParams } from '../types';
import { GasEstimateTypes } from '../../../../../shared/constants/gas';
import { hexToDecimal } from '../../../../../shared/modules/conversion.utils';
import SharedChainProvider from '../../../../../shared/shared-chain-provider/base';

const ENERGY_MAX_ESTIMATE = 65000;
const BANDWIDTH_RATE = 1000; // unit price of bandwidth is 1000sun
const ENERGY_RATE = 420; // unit price of energy is 420sun

export default class TxController {
  private client: typeof TronWeb;

  private sharedProvider: SharedChainProvider;

  private getCurrentAccount: () => any;

  private getCurrentAccountKeys: () => Promise<{
    privateKey: string;
    hdKey: any;
  }>;

  private enqueueWithCooldown: EnqueueWithCooldown;

  constructor({
    client,
    sharedProvider,
    getCurrentAccount,
    getCurrentAccountKeys,
    enqueueWithCooldown,
  }: {
    client: typeof TronWeb;
    sharedProvider: SharedChainProvider;
    getCurrentAccount: () => any;
    getCurrentAccountKeys: () => Promise<{
      privateKey: string;
      hdKey: any;
    }>;
    enqueueWithCooldown: EnqueueWithCooldown;
  }) {
    this.client = client;
    this.sharedProvider = sharedProvider;
    this.getCurrentAccount = getCurrentAccount;
    this.getCurrentAccountKeys = getCurrentAccountKeys;
    this.enqueueWithCooldown = enqueueWithCooldown;
  }

  async approveTransaction(txMeta: any) {
    const { txParams } = txMeta;
    let txHash;
    if (txParams.data) {
      txHash = await this.transfer(txParams);
    } else {
      txHash = await this.simpleSend(txParams);
    }
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
    const feeParams = await this.enqueueWithCooldown(
      this.getFee.bind(this, txMeta.txParams),
    );
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

  abi(contract: string) {
    return this.client.contract().at(contract);
  }

  async getFee({ data, to, from, value }: TxParams): Promise<FeeParams> {
    let feeCs = 0;
    let feeTrx = 0;
    let energyEstimate = 0;
    let energyBalance;

    const fromAddress = from;

    const bandwidthBalance = await this.client.trx.getBandwidth(fromAddress);

    const amount = hexToBN(value).toString();

    if (data) {
      energyEstimate = ENERGY_MAX_ESTIMATE;

      const [accountResources, estimates] = await Promise.all([
        this.client.trx.getAccountResources(fromAddress),
        this.client.eventServer.request(
          '/wallet/estimateenergy',
          {
            owner_address: fromAddress,
            contract_address: to,
            function_selector: 'transfer(address,uint256)',
            parameter: stripHexPrefix(data),
            visible: true,
          },
          'POST',
        ),
      ]);
      if (estimates?.energy_required) {
        energyEstimate = estimates.energy_required;
      }

      energyBalance =
        (accountResources.EnergyLimit || 0) -
        (accountResources.EnergyUsed || 0);

      feeCs =
        energyBalance - energyEstimate <= 0 ? energyEstimate * ENERGY_RATE : 0;
    } else {
      const tx = await this._buildTransaction(fromAddress, to, amount);
      const txLen = Buffer.from(tx.raw_data_hex, 'hex').length;

      feeTrx = bandwidthBalance <= 0 ? txLen * BANDWIDTH_RATE : 0;
    }

    return {
      feeLimit: feeTrx + feeCs,
      bandwidth: bandwidthBalance,
      ...(data ? { energy: energyBalance } : {}),
    };
  }

  async _buildTransaction(
    fromAddress: string,
    toAddress: string,
    amount: string,
  ) {
    const tradeobj = await this.client.transactionBuilder.sendTrx(
      toAddress,
      amount,
      fromAddress,
    );
    return tradeobj;
  }

  async broadcast(hash: string): Promise<any> {
    const response = await this.client.trx.sendRawTransaction(hash);
    if (!response.result) {
      throw new Error('Transaction broadcast failed');
    }
    return response;
  }

  async simpleSend(txParams: TxParams) {
    const tx = await this._buildTransaction(
      txParams.from,
      txParams.to,
      parseInt(txParams.value, 16).toString(),
    );

    const { privateKey } = await this.getCurrentAccountKeys();
    const signedtxn = await this.client.trx.sign(tx, privateKey);
    const result = await this.broadcast(signedtxn);
    return result.txid;
  }

  async transfer(txParams: {
    data: string;
    localId: string;
    from: string;
    to: string;
    feeParams: FeeParams;
  }) {
    const { privateKey } = await this.getCurrentAccountKeys();
    const { nativeAddress } = this.getCurrentAccount();

    this.client.setAddress(nativeAddress);
    this.client.setPrivateKey(privateKey);

    const { toAddress, tokenAmount } =
      this.sharedProvider.parseTokenTransferData(txParams.data);
    const abi = await this.abi(txParams.to);
    const result = await abi.transfer(toAddress, tokenAmount.toString()).send({
      feeLimit: hexToDecimal(txParams.feeParams.feeLimit),
    });
    return result;
  }
}
