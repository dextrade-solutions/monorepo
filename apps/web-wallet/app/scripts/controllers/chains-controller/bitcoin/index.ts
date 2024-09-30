import { Buffer } from 'buffer';
import { address, networks, payments } from 'bitcoinjs-lib';
import { arrToBufArr } from 'ethereumjs-util';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { KeyringController } from '../../../../overrided-metamask/eth-keyring-controller';

import BlockcypherService from '../../../services/blockcypher-service';
import GetblockService from '../../../services/getblock-service';
import BlockstreamService from '../../../services/blockstream-service';
import BlockchainInfoService from '../../../services/blockchaininfo-service';

import { TxReceipt } from '../../../../../shared/constants/transaction';
import PreferencesController from '../../preferences';
import BaseController from '../base';
import { ChainControllerOptions } from '../types';
import { MINUTE } from '../../../../../shared/constants/time';
import { AssetBalance } from '../../../../overrided-metamask/assets-controllers';
import { TransactionMeta } from '../../transactions';
import BlockTracker from './block-tracker';
import IncomingTransactions from './incoming-transactions';
import TxController from './tx-controller';
import BitcoinChainController from './interface';
import { BlockChainInfoTx } from './types';

/**
 * Request limits:
 *
 * blockcypher.com - 200/hour by one IP
 * getblock.io - 40k/day
 */

export default class BitcoinController
  extends BaseController
  implements BitcoinChainController
{
  incomingTransactionsController;

  txController;

  blockTracker;

  blockcypherService;

  blockstreamService;

  blockchainInfoService;

  getblockService;

  network;

  readonly preferencesController: PreferencesController;

  readonly keyringController: KeyringController;

  private _txsInfo: BlockChainInfoTx[] = [];

  private _txsAddress: string[] = [];

  private infoInterval?: ReturnType<typeof setInterval>;

  private readonly infoIntervalTimeout = 8 * MINUTE;

  constructor(opts: ChainControllerOptions) {
    super(opts);
    this.preferencesController = opts.preferencesController;
    this.keyringController = opts.keyringController;

    this.blockchainInfoService = new BlockchainInfoService();
    this.getblockService = new GetblockService({ isTestnet: this.isTestnet });
    this.blockstreamService = new BlockstreamService({
      isTestnet: this.isTestnet,
    });
    this.blockcypherService = new BlockcypherService({
      isTestnet: this.isTestnet,
    });

    this.incomingTransactionsController = new IncomingTransactions(this);

    this.blockTracker = new BlockTracker();
    this.txController = new TxController({
      store: this.store,
      getblockService: this.getblockService,
      getCurrentAccountKeys: this.getCurrentAccountKeys.bind(this),
      updateAccount: this.updateAccount.bind(this),
      enqueueWithCooldown: this.enqueueWithCooldown.bind(this),
      blockchainInfoService: this.blockchainInfoService,
    });
    this.network = this.isTestnet ? networks.testnet : networks.bitcoin;
  }

  async start() {
    await this.lookupNetwork();
    this.initialized = true;
    this.incomingTransactionsController.start();
  }

  async stop() {
    if (this.infoInterval) {
      clearInterval(this.infoInterval);
    }
    this.incomingTransactionsController.stop();
  }

  destroy(): void {
    this.stop();
    this.store.removeAllListeners();
  }

  getStandard(): string {
    return 'bip49';
  }

  async getTransactionReceipt({
    hash: txHash,
  }: TransactionMeta): Promise<TxReceipt | null> {
    // const receipt = (await this.enqueueWithCooldown(
    //   this.blockcypherService.getTransaction.bind(
    //     this.blockcypherService,
    //     txHash,
    //   ),
    // )) as any;
    // if (receipt && receipt.confirmations > 0) {
    //   const CONFIRMED = '0x1';
    //   return {
    //     status: CONFIRMED,
    //     feeUsed: receipt.fees || 0,
    //     blockNumber: receipt.block_height,
    //     blockHash: receipt.block_hash,
    //   };
    // }
    const CONFIRMED_STATUS = '0x1';
    const txReceipt = {
      status: CONFIRMED_STATUS,
      blockNumber: '0',
      blockHash: '0',
    } as TxReceipt;

    const receipt = this.txsInfo.find(({ hash }) => hash === txHash);
    if (this.txsInfo.length >= 50 && !receipt) {
      return txReceipt;
    }

    if (!receipt) {
      return null;
    }

    const height = this.store.getState().network?.height || 0;
    const isConfirmation = height - (receipt?.block_height || 0) >= 2;

    if (isConfirmation) {
      if (receipt.block_height) {
        txReceipt.blockNumber = receipt.block_height.toString();
      }
      if (receipt.block_hash) {
        txReceipt.blockHash = receipt.block_hash;
      }
      if (receipt.fee) {
        txReceipt.feeUsed = (receipt.fee || 0).toString();
      }
      return txReceipt;
    }

    return null;
  }

  deriveAccount(hdKey: HDKey) {
    if (!hdKey.publicKey) {
      throw new Error('No public key');
    }
    const btcAccount = payments.p2pkh({
      pubkey: arrToBufArr(hdKey.publicKey),
      network: this.network,
    });
    if (!btcAccount.address || !hdKey.privateKey) {
      throw new Error('Incorrect hdKey');
    }
    return {
      address: btcAccount.address,
      privateKey: Buffer.from(hdKey.privateKey).toString('hex'),
    };
  }

  async lookupNetwork() {
    try {
      await this.updateNetInfo();
    } catch (e) {
      console.error(e);
    }
  }

  async updateNetInfo() {
    const updaterNetInfo = async () => {
      const result = (await this.enqueueWithCooldown(
        this.blockcypherService.getNetInfo.bind(this.blockcypherService),
      )) as any;
      this.store.updateState({
        network: {
          latestBlock: result.hash,
          previousBlock: result.previous_hash,
          highFeePerKb: result.high_fee_per_kb,
          mediumFeePerKb: result.medium_fee_per_kb,
          lowFeePerKb: result.low_fee_per_kb,
          peerCount: result.peer_count,
        },
      });
    };

    await updaterNetInfo();
    this.infoInterval = setInterval(async () => {
      await updaterNetInfo();
    }, this.infoIntervalTimeout);
  }

  getBalanceBlockcypher(addrs: string) {
    return this.blockcypherService.getAddressInfo(addrs);
  }

  getBalance(addrs: string) {
    return this.getBalanceBlockcypher(addrs);
  }

  public get txsInfo(): BlockChainInfoTx[] {
    return this._txsInfo;
  }

  public get txsAddress(): string[] {
    return this._txsAddress;
  }

  async getBalanceMulti(tokens: AssetBalance[]): Promise<AssetBalance[]> {
    if (this.isTestnet) {
      // getBalanceMulti not supported on testnet
      return tokens;
    }

    return this.enqueueWithCooldown(async () => {
      const addressList = tokens.map((token) => token.account);
      const { addresses, txs } =
        await this.blockchainInfoService.getAccountByList(addressList);
      this._txsAddress = addressList;
      this._txsInfo = txs;
      return addresses.map(
        // eslint-disable-next-line camelcase
        (result: { address: string; final_balance: string }) => {
          return {
            localId: this.chainId,
            account: result.address,
            balance: result.final_balance,
            balanceError: null,
          };
        },
      );
    });
  }

  async updateAccount() {
    const addrs = await this.getOrCreateAccountAddress();
    await this.enqueueWithCooldown(async () => {
      const result = await this.getBalance(addrs);
      this.updateCurrentAccount('nativeBalance', result.balance);
      this.updateCurrentAccount('info', result);
      return result;
    });
  }

  getTokenBalance(_contract: string, _address: string): Promise<string> {
    throw new Error('Bitcoin protocol is not supporting contracts');
  }
}
