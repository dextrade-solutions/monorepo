import TronWeb from 'tronweb-fetch/dist/TronWeb';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { arrToBufArr, addHexPrefix } from 'ethereumjs-util';

import { TxReceipt } from '../../../../../shared/constants/transaction';

import { ChainControllerOptions } from '../types';
import BaseController from '../base';
import ChainsController from '../interface';
import { SECOND } from '../../../../../shared/constants/time';
import { TransactionMeta } from '../../transactions';
import IncomingTransactions from './incoming-transactions';
import TxController from './tx-controller';
import { AssetsContractController } from './assets-contract-controller';

const TRON_HOST = {
  mainnet: 'https://api.trongrid.io',
  testnetNile: 'https://nile.trongrid.io',
  testnetShasta: 'https://api.shasta.trongrid.io',
};

export default class TronController
  extends BaseController
  implements ChainsController
{
  assetsContractController: AssetsContractController;

  incomingTransactionsController: IncomingTransactions;

  txController: TxController;

  client: typeof TronWeb;

  constructor(opts: ChainControllerOptions) {
    super(opts);
    this.client = new TronWeb({
      fullHost: opts.isTestnet ? TRON_HOST.testnetShasta : TRON_HOST.mainnet,
    });

    this.txController = new TxController({
      client: this.client,
      sharedProvider: this.sharedProvider,
      getCurrentAccount: this.getCurrentAccount.bind(this),
      getCurrentAccountKeys: this.getCurrentAccountKeys.bind(this),
      enqueueWithCooldown: this.enqueueWithCooldown.bind(this),
    });

    this.cooldown = 4 * SECOND;
    this.incomingTransactionsController = new IncomingTransactions({
      client: this.client,
      getAccount: this.getCurrentAccount.bind(this),
      preferencesController: this.preferencesController,
      chainControllerStore: this.store,
      chainId: this.chainId,
    });

    this.assetsContractController = new AssetsContractController({
      tronwebClient: this.client,
    });
  }

  async start() {
    this.lookupNetwork();
    this.incomingTransactionsController.start();
  }

  async stop() {
    this.incomingTransactionsController.stop();
  }

  destroy() {
    this.stop();
    this.store.removeAllListeners();
  }

  async lookupNetwork() {
    const address = await this.getOrCreateAccountAddress();
    this.client.setAddress(address);
    this.initialized = true;
  }

  async updateAccount() {
    const address = await this.getOrCreateAccountAddress();
    const result = await this.getBalance(address);
    this.updateCurrentAccount('nativeBalance', result.toString());
    this.updateCurrentAccount('info', {});
    return this.getCurrentAccount();
  }

  abi(contract: string) {
    return this.client.contract().at(contract);
  }

  async getBalance(address: string): Promise<string> {
    try {
      const result = await this.client.trx.getBalance(address);
      return result.toString();
    } catch (e) {
      console.info(
        '[chain-tron.getBalance] Probably account does not yet exist',
      );
      return '0';
    }
  }

  async getTokenBalance(contract: string, address: string): Promise<string> {
    this.client.setAddress(address);
    const abi = await this.abi(contract);
    const balance = await abi.balanceOf(address).call();
    return balance.toString();
  }

  deriveAccount(hdKey: HDKey): { address: string; privateKey: string } {
    if (!hdKey.privateKey) {
      throw new Error('Not provided private key');
    }
    const privKeyString = arrToBufArr(hdKey.privateKey).toString('hex');
    const address = this.client.address.fromPrivateKey(privKeyString);
    this.client.setAddress(address);
    return {
      address,
      privateKey: privKeyString,
    };
  }

  async getTransactionReceipt({
    hash,
  }: TransactionMeta): Promise<TxReceipt | null> {
    const response = await this.client.trx.getTransactionInfo(hash);
    if (response?.receipt) {
      const CONFIRMED = '0x1';
      return {
        status: CONFIRMED,
        feeUsed: addHexPrefix((response.fee || 0).toString(16)),
        blockNumber: response.blockNumber,
        blockTimestamp: response.blockTimeStamp,
      };
    }
    return null;
  }

  getStandard(): string {
    return 'tron';
  }

  isAddress(address: string): boolean {
    return TronWeb.isAddress(address);
  }
}
