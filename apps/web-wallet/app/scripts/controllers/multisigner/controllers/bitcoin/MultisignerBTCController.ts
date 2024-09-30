import elliptic from 'elliptic';
import { calcTokenAmount } from '../../../../../../shared/lib/transactions-controller-utils';
import MultisignerServiceApi from '../../../../services/multisigner-service';
import { IMultisign, IMultisignTransaction } from '../../types';
import {
  IMultisignerControllerProps,
  IMultisignerTransactionCreate,
  IMultisignerTransactionWeight,
} from '../IMultisignerController';
import { MultisignerController } from '../MultisignerController';
import { IAddress, IAddressTransaction } from './types';

const enum EKeys {
  GET_ADDRESSES = 'GET_ADDRESSES',
}

export class MultisignerBTCController extends MultisignerController {
  private readonly currency: string = 'BTC';

  private readonly api: MultisignerServiceApi;

  private readonly decimals = 8; // TODO: get decimal value from asset constant

  constructor(props: IMultisignerControllerProps) {
    super(props.config);
    this.api = new MultisignerServiceApi({
      getMnemonicHash: this.getWalletMnemonicHash,
    });
  }

  private addressNormilizer(data: IAddress): IMultisign {
    const {
      id,
      pubkeys,
      cdt,
      out: minForBroadcasting,
      added,
      address,
      of: totalSigners,
    } = data;

    return {
      id,
      account: address,
      initiatorAddress: '',
      totalSigners,
      minForBroadcasting,
      pubkeys,
      added,
      provider: { chainId: this.isTestnet ? 'bitcoin_testnet' : 'bitcoin' },
      cdt,
    };
  }

  private convertFiat(value: number): number {
    const conversionRate = this.rates[this.currency]?.conversionRate || 0;
    const amount = calcTokenAmount(value, 0);
    return Number(amount.mul(conversionRate).toString());
  }

  private addressTxNormilizer(
    data: IAddressTransaction,
  ): IMultisignTransaction {
    const {
      id,
      txHash,
      addressId,
      amount,
      fee,
      hex,
      toAddress,
      sigHashes,
      signStatus,
      toSignCount,
      cdt,
      network,
      weight,
      status,
      signedCount,
      errorMessage,
    } = data;

    return {
      id,
      addressId,
      txHash,
      toAddress,
      status: status?.value || 'PENDING',
      signStatus: signStatus?.value || 'WAIT',
      signedCount,
      toSignCount,
      sigHashes,
      hex,
      cdt,
      errorMessage,

      amount,
      fee,
      amountFiat: this.convertFiat(amount),
      feeFiat: this.convertFiat(fee),

      txId: 0,
    } as IMultisignTransaction;
  }

  private async loadAddresses() {
    const pubKey = await this.getPublicKey();
    const msList: IAddress[] = (await this.api.addressIndex()).filter(
      ({ pubkeys }) => pubkeys.includes(pubKey),
    );
    const multisigs: Map<string, IMultisign> = new Map();

    for (const ms of msList) {
      multisigs.set(ms.id, this.addressNormilizer(ms));
    }
    this.update({ multisigs });
    await this.loadTransactionsAll();
    return msList;
  }

  private async loadTransactionsAll() {
    const txList = await this.api.transactionsAll();
    const transactions = new Map<
      IMultisignTransaction['id'],
      IMultisignTransaction
    >();

    for (const tx of txList) {
      transactions.set(tx.id, this.addressTxNormilizer(tx));
    }

    this.update({ transactions });
    return transactions;
  }

  public async loadPendingTransactions() {
    // return await this.api.transactionPending();
  }

  private async loadTransactionsByStatus(status: string) {
    return this.api.transactionIndexByStatus(status);
  }

  private async loadTransactionsById(id: string): Promise<IAddressTransaction> {
    const tx = await this.api.transactionById(id);
    const { transactions } = this.state;

    transactions.set(tx.id, this.addressTxNormilizer(tx));
    this.update({ transactions });
    return tx;
  }

  private async simpleSign(txId: string, sigs: string[]): Promise<string[]> {
    if (!txId) {
      throw Error(`[SIGN] Invalid transaction ID: ${txId}`);
    }
    const ec = new elliptic.ec('secp256k1');

    const privatKey = await this.getPrivateKey();
    const key = ec.keyFromPrivate(privatKey, 'hex');

    const signedTransactions = sigs.map((message) => {
      const signature = key.sign(message, { canonical: true });
      return signature.toDER('hex');
    });

    return signedTransactions;
  }

  private fixedAmount(amount: number): string {
    const num = Number(amount / 10 ** this.decimals);
    return num % 1 === 0 ? num.toString() : num.toFixed(this.decimals);
  }

  public async loadTransactionsByAddress(
    addressId: string,
  ): Promise<IAddressTransaction[]> {
    const txs: IAddressTransaction[] = await this.api.transactionIndex(
      addressId,
    );
    const { transactions } = this.state;

    if (txs.length) {
      txs.forEach((tx) => {
        transactions.set(tx.id, this.addressTxNormilizer(tx));
      });
    }

    this.update({ transactions });
    return txs;
  }

  async onStart(): Promise<void> {
    // load all addresses and all addresses transactions
    this.createPolling(EKeys.GET_ADDRESSES, this.loadAddresses.bind(this), {
      timeout: this.isTestnet ? 2000 : 10000,
    });
  }

  async onStop(): Promise<void> {
    this.api.abort();
  }

  async generate(): Promise<string> {
    const pubKey = await this.getPublicKey();
    const id = await this.api.addressCreate({
      of: this.creator.totalSigners,
      out: this.creator.minForBroadcasting,
      pubKey,
    });
    await this.getPolling(EKeys.GET_ADDRESSES).pull();
    return id;
  }

  async add(multisignId: string): Promise<void> {
    const pubKey = await this.getPublicKey();
    await this.api.addressAddSign({
      id: multisignId,
      pubKey,
    });
    await this.getPolling(EKeys.GET_ADDRESSES).pull();
  }

  async remove(multisignId: string): Promise<void> {
    try {
      await this.api.deleteAddress(multisignId);
      const { multisigs } = this.state;
      multisigs.delete(multisignId);
      this.update({ multisigs });
    } catch (err) {
      console.error(err);
    }
  }

  async transactionWeight({
    id: addressId,
    amount,
    toAddress,
  }: IMultisignerTransactionWeight): Promise<any> {
    return await this.api.transactionWeight({
      addressId,
      toAddress,
      amount: this.fixedAmount(amount),
    });
  }

  async transactionCreate({
    id: addressId,
    amount,
    toAddress,
    fee = 0,
  }: IMultisignerTransactionCreate): Promise<any> {
    const created = await this.api.transactionCreate({
      fee,
      toAddress,
      addressId,
      amount: this.fixedAmount(amount),
    });

    const { id, sigHashes } = created;

    const signedTransactions = await this.simpleSign(id, sigHashes);
    await this.api.transactionSign(id, signedTransactions);
    await this.loadTransactionsById(id);
    return created;
  }

  async transactionSign(txId: string): Promise<void> {
    const tx = this.state.transactions.get(txId);
    if (!tx) {
      throw Error(`[TRANSACTION SIGN] Transaction by ID: ${txId} not found!`);
    }
    const signedTransactions = await this.simpleSign(txId, tx.sigHashes);

    await this.api.transactionSign(txId, signedTransactions);
    await this.loadTransactionsById(txId);
  }

  async transactionDecline(txId: string): Promise<void> {
    await this.api.transactionDecline(txId);
    await this.loadTransactionsById(txId);
  }
}
