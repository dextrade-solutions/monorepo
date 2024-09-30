import { Buffer } from 'buffer';
import { Web3 } from 'web3';
import MultisignerBNBServiceApi from '../../../../services/multisigner-bnb-service';
import { IMultisign, IMultisignTransaction } from '../../types';
import {
  IMultisignerControllerProps,
  IMultisignerTransactionCreate,
  IMultisignerTransactionWeight,
} from '../IMultisignerController';
import { MultisignerController } from '../MultisignerController';
import { abi, bytecode } from './multisigner-helper';
import { IMultisignBinance } from './types';

/**
 * export interface IMultisigTransactionData {
 * id: string;
 * multisigId: string;
 * addressId: string;
 * txId: number;
 * txHash: string;
 * amount: number;
 * gas: string;
 * gasPrice: string;
 * fee: string;
 * fromAddress: string;
 * toAddress: string;
 * signers: string[];
 * cdt: string;
 * }
 *
 * export interface IMultisigData {
 * id: string;
 * addressId: string;
 * initiatorAddress: string;
 * totalSigners: number;
 * minForBroadcasting: number;
 * pubkeys: string[];
 * status: 'INIT' | 'CREATED' | 'FORBIDDEN';
 * transactions: IMultisigTransactionData[];
 * balance: string;
 * balanceFiat: string;
 * cdt: string;
 * symbol: string;
 * }
 */

const enum EKeys {
  MULTISIGNS = 'MULTISIGNS',
}

// TODO: refactor next code
const getHost = (isTestnet: boolean) =>
  isTestnet
    ? 'https://data-seed-prebsc-1-s1.binance.org:8545/'
    : 'https://bsc-dataseed1.binance.org';

export class MultisignerBNBController extends MultisignerController {
  private readonly api: MultisignerBNBServiceApi;

  private web3: Web3 | undefined;

  constructor(props: IMultisignerControllerProps) {
    super(props.config);
    this.api = new MultisignerBNBServiceApi({
      getMnemonicHash: this.getWalletMnemonicHash.bind(this),
    });
  }

  private async getSigner(web3: Web3) {
    const privateKey = await this.getPrivateKey();
    return web3.eth.accounts.privateKeyToAccount(
      Buffer.from(privateKey, 'hex'),
    );
  }

  private getWeb3Instance(): Web3 {
    if (this.web3) {
      return this.web3;
    }
    this.web3 = new Web3(getHost(this.isTestnet));
    return this.web3;
  }

  private getContractInstance(
    web3: Web3,
    address: string | undefined = undefined,
  ) {
    const contract = new web3.eth.Contract(abi, address);
    contract.options.data = bytecode;
    return contract;
  }

  public async deploy(opt: { id: string; signers: string[]; out: number }) {
    console.log('Deploy multisig', opt);
    const { signers, out } = opt;

    const web3 = this.getWeb3Instance();

    const signer = await this.getSigner(web3);
    web3.eth.accounts.wallet.add(signer);

    const contract = this.getContractInstance(web3);

    const deployOptions = {
      arguments: [signers, out],
    };
    const deployTx = contract.deploy(deployOptions);
    try {
      const deployedContract = await deployTx
        .send({
          from: signer.address,
          gas: await deployTx.estimateGas(),
        })
        .once('transactionHash', (txhash) => {
          console.log(`Mining deployment transaction ...`);
          console.log(`Txid: ${txhash}`);
        });

      console.log(`Contract deployed at ${deployedContract.options.address}`);
      console.log(
        `Add DEMO_CONTRACT to the.env file to store the contract address: ${deployedContract.options.address}`,
      );

      await this.api.updateMultisign(opt.id, {
        account: deployedContract.options.address,
        cdt: this.cdt,
      });
      alert(`Deploy multisig. Address: ${deployedContract.options.address}`);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
        alert(`Deploy multisig. err: ${err?.message}`);
      }
    }
  }

  private async checkReadyForDeploy(multisigs: IMultisign[]) {
    const readyMultisigs = multisigs.filter(
      ({ pubkeys, totalSigners, account, initiatorAddress }) =>
        !account &&
        [...new Set(pubkeys)].length === totalSigners &&
        initiatorAddress === this.selectedAddress,
    );
    if (readyMultisigs.length) {
      console.info('READY multisigs to deploy', readyMultisigs.length);
    }
    await Promise.all(
      readyMultisigs.map(({ pubkeys: signers, minForBroadcasting: out, id }) =>
        this.deploy({ id, signers, out }),
      ),
    );
  }

  private async getAllMyMultisig(): Promise<void> {
    const mss: IMultisignBinance[] = await this.api.getUserMultisigns(
      this.selectedAddress,
    );

    const multisigs = new Map<IMultisign['id'], IMultisign>();
    const transactions = new Map<
      IMultisignTransaction['id'],
      IMultisignTransaction
    >();

    for (const ms of mss) {
      multisigs.set(ms.id, ms);
      if (ms.transactions && ms.transactions.length) {
        ms.transactions.map((t) => transactions.set(t.id, t));
      }
    }

    this.update({
      multisigs,
      transactions,
    });
    if (mss.length) {
      await this.checkReadyForDeploy(mss);
    }
  }

  async onStart(): Promise<void> {
    this.createPolling(EKeys.MULTISIGNS, this.getAllMyMultisig.bind(this), {
      timeout: 3000,
    });
  }

  async onStop(): Promise<void> {}

  async generate(): Promise<string> {
    console.log('Init multisig create', this.creator);
    const defaultValue = {
      id: '',
      account: '',
      initiatorAddress: this.selectedAddress,
      totalSigners: this.creator.totalSigners,
      minForBroadcasting: this.creator.minForBroadcasting,
      pubkeys: [this.selectedAddress],
      status: 'INIT',
      cdt: this.cdt,
      provider: this.provider,
      added: 1,
      //
      transactions: [],
    };
    const id = await this.api.init(defaultValue);
    console.log(`[${this._className} | ${this.name}]: init multisign ${id}`);
    await this.getPolling(EKeys.MULTISIGNS).pull();
    return id;
  }

  async add(multisignId: string): Promise<void> {
    const id = multisignId.trim();
    const multisig = await this.api.getById(id);
    console.log(`Join to multisig by ID: ${id}`, { ...multisig });
    if (!multisig) {
      return;
    }

    const { pubkeys } = multisig;
    if (pubkeys.includes(this.selectedAddress)) {
      return;
    }

    const updatedData = {
      ...multisig,
      pubkeys: [...multisig.pubkeys, this.selectedAddress],
      added: multisig.added + 1,
    };

    await this.api.updateMultisign(id, updatedData);
    await this.getPolling(EKeys.MULTISIGNS).pull();
  }

  async remove(multisignId: string): Promise<void> {
    await this.api.remove(multisignId);
    const { multisigs } = this.state;
    multisigs.delete(multisignId);
    this.update({ multisigs });
  }

  async transactionWeight(
    payload: IMultisignerTransactionWeight,
  ): Promise<any> {
    return null;
  }

  async transactionCreate(
    payload: IMultisignerTransactionCreate,
  ): Promise<any> {
    try {
      console.log('Create BNB transactions', payload);
      const gas = 190310;

      const { toAddress, amount, id } = payload;
      if (!toAddress || !amount || !id) {
        return;
      }

      const multisig: IMultisign = await this.api.getById(id);
      console.log('multisig', multisig);
      if (!multisig || !multisig.account) {
        throw new Error('No multisig data');
      }
      const { account } = multisig;
      console.log('Create multisig transactions', {
        ...payload,
        gas,
        multisig,
      });
      const transactionData: IMultisignTransaction = {
        id: Number(new Date()).toString(),
        account: account as string,
        amount,
        txHash: '',
        toAddress,
        status: 'PENDING',
        signedCount: 1,
        toSignCount: multisig.minForBroadcasting - 1,
        sigHashes: [this.selectedAddress],
        cdt: this.cdt,
        fee: 0,
        //
        multisigId: id,
        txId: 0,
        // gas: '0',
        // gasPrice: '0',
      };

      const web3 = this.getWeb3Instance();
      const signer = await this.getSigner(web3);
      web3.eth.accounts.wallet.add(signer);

      const contract = this.getContractInstance(web3, account);

      const tx = {
        value: 0,
        gas: `0x${gas.toString(16)}`,
        gasPrice: `0x${(0.000000005 * 10 ** 18).toString(16)}`,
        data: contract.methods
          .submitTransaction(toAddress, amount.toString(), '0x')
          .encodeABI(),
        nonce: await web3.eth.getTransactionCount(signer.address),
        from: signer.address,
        to: account,
      };

      const signed = await signer.signTransaction(tx);

      transactionData.txId = await new Promise((r) =>
        web3.eth
          .sendSignedTransaction(signed.rawTransaction)
          .once('transactionHash', (txhash) => {
            console.log(`Initializing transaction ...`);
            console.log(`Txid: ${txhash}`);
            transactionData.txHash = txhash;
          })
          .once('receipt', (receipt) => {
            console.log(`Receipt: `, receipt);

            r(web3.utils.hexToNumber(receipt.logs[0].topics[1]));
          }),
      );

      // transactionData.gas = Number(tx.gas).toString();
      // transactionData.gasPrice = Number(tx.gasPrice).toString();
      transactionData.fee = Number(tx.gas) * Number(tx.gasPrice);

      multisig.transactions = [
        ...(multisig.transactions || []),
        transactionData,
      ];

      console.log('multisig', multisig);
      console.log('transactionData', transactionData);
      await this.api.updateMultisign(id, multisig);
      return {
        ...transactionData,
        gas: Number(tx.gas).toString(),
        gasPrice: Number(tx.gasPrice).toString(),
      };
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        throw Error(err);
      }
    }
  }

  async transactionSign(txId: string): Promise<void> {
    const id = txId.trim();
    try {
      const trx: IMultisignTransaction = await this.api.getTransactionById(
        txId,
      );
      if (!trx || trx.sigHashes.includes(this.selectedAddress)) {
        throw Error('Tx is already signed!');
      }
      const { account, txId: hash } = trx;
      const gas = 390310;

      console.log('Transaction multisig sign', id, hash);
      const web3 = this.getWeb3Instance();

      const signer = await this.getSigner(web3);
      web3.eth.accounts.wallet.add(signer);

      const contract = await this.getContractInstance(web3, account);

      const tx = {
        value: 0,
        gas: `0x${gas.toString(16)}`,
        gasPrice: `0x${(0.000000005 * 10 ** 18).toString(16)}`,
        data: contract.methods.confirmTransaction(hash).encodeABI(),
        nonce: await web3.eth.getTransactionCount(signer.address),
        from: signer.address,
        to: account,
      };

      const signed = await signer.signTransaction(tx);

      await new Promise((r) => {
        web3.eth
          .sendSignedTransaction(signed.rawTransaction)
          .once('transactionHash', (txhash) => {
            console.log(`Confirming transaction ...`);
            console.log(`Txid: ${txhash}`);
          })
          .once('receipt', (receipt) => {
            console.log(`Receipt: `, receipt);
            r(receipt);
          });
      });

      trx.sigHashes = [...trx.sigHashes, this.selectedAddress];
      await this.api.updateTransactionsById(id, trx);
    } catch (err) {
      console.error(err);
    }
  }

  async transactionDecline(txId: string): Promise<void> {
    throw new Error('Not implemented yet');
  }
}
