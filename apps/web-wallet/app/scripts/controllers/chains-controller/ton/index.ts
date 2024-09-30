import { Address, OpenedContract, TonClient, WalletContractV4 } from '@ton/ton';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { arrToBufArr, addHexPrefix } from 'ethereumjs-util';
import nacl from 'tweetnacl';

import { TxReceipt } from '../../../../../shared/constants/transaction';

import { ChainControllerOptions } from '../types';
import BaseController from '../base';
import ChainsController from '../interface';
import { SECOND } from '../../../../../shared/constants/time';
import { TransactionMeta } from '../../transactions';
import TonapiServiceApi from '../../../services/tonapi-service';
import TxController from './tx-controller';
import IncomingTransactions from './incoming-transactions';

const TON_HOST = {
  mainnet: 'https://toncenter.com/api/v2/jsonRPC',
};
const TON_API_KEY =
  '13ff94d0f2390692b6b96b089f61e2e38f5a4ddecd88aa6c398ae440b7fe8797';

export default class TonController
  extends BaseController
  implements ChainsController
{
  incomingTransactionsController: IncomingTransactions;

  txController: TxController;

  client: TonClient;

  constructor(opts: ChainControllerOptions) {
    super(opts);
    this.client = new TonClient({
      endpoint: TON_HOST.mainnet,
      apiKey: TON_API_KEY,
    });

    this.txController = new TxController(this);

    this.cooldown = 4 * SECOND;
    this.incomingTransactionsController = new IncomingTransactions(this);
  }

  async start() {
    this.lookupNetwork();
    this.incomingTransactionsController.start();
  }

  async stop() {
    this.incomingTransactionsController.stop();
  }

  async lookupNetwork() {
    await this.getOrCreateAccountAddress();
    this.initialized = true;
  }

  getTonWalletAndContract(hdKey: HDKey, workchain = 0) {
    const keyPair = nacl.sign.keyPair.fromSeed(hdKey.privateKey);
    const wallet = WalletContractV4.create({
      workchain,
      publicKey: Buffer.from(keyPair.publicKey),
    });
    const contract = this.client.open(wallet);

    return {
      contract,
      wallet,
      keyPair,
    };
  }

  async getBalance(): Promise<string | null> {
    try {
      const hdKey = await this.deriveHdKey(0);
      const { contract } = this.getTonWalletAndContract(hdKey);
      const result = await contract.getBalance();
      return result.toString();
    } catch (e) {
      return null;
    }
  }

  async getTokenBalance(contract: string, address: string): Promise<string> {
    const abi = await this.abi(contract);
    const balance = await abi.balanceOf(address).call();
    return balance.toString();
  }

  deriveAccount(hdKey: HDKey): { address: string; privateKey: string } {
    if (!hdKey.privateKey) {
      throw new Error('Not provided private key');
    }
    const privKeyString = arrToBufArr(hdKey.privateKey).toString('hex');
    const { wallet } = this.getTonWalletAndContract(hdKey);
    return {
      address: wallet.address.toString(),
      privateKey: privKeyString,
    };
  }

  async getTransactionReceipt(
    txMeta: TransactionMeta,
  ): Promise<TxReceipt | null> {
    const {
      data: { transactions },
    } = await TonapiServiceApi.getTransactions(txMeta.txParams.from, {
      limit: 3,
    });
    const tx = transactions.find(
      (t: any) => t.in_msg.decoded_body?.seqno === txMeta.seqno,
    );
    if (tx) {
      txMeta.hash = tx.hash;
      const CONFIRMED = '0x1';
      return {
        status: CONFIRMED,
        feeUsed: addHexPrefix((tx.total_fees || 0).toString(16)),
        blockNumber: tx.block,
        blockTimestamp: tx.lt,
      };
    }
    return null;
  }

  getStandard(): string {
    return 'ton';
  }
}
