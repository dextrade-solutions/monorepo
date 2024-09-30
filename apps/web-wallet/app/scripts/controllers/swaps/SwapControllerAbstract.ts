import { Buffer } from 'buffer';
import { HDKey } from 'ethereum-cryptography/hdkey';
import {
  AbiInput,
  ContractAbi,
  HexString,
  utils as web3Utils,
  Web3,
} from 'web3';
import { NetworkNames } from '../../../../shared/constants/exchanger';
import {
  CHAIN_ID_TO_RPC_URL_MAP,
  CHAIN_IDS,
} from '../../../../shared/constants/network';
import { TransactionType } from '../../../../shared/constants/transaction';
import { decimalToHex } from '../../../../shared/modules/conversion.utils';
import TransactionController from '../transactions';
import { ERC20_ABI } from './pancakeswap/contracts';
import SwapsController from './swaps';
import {
  IExchangerCoin,
  IGetApprovedAllowanceResult,
  INormalizeRates,
  IServiceController,
  ISwapExchangerParams,
} from './types';

type ValueOf<T> = T[keyof T];
// type ValueOf<T extends unknown> = (typeof T)[keyof typeof T];

// TODO: refactor next code/ get constants from network/chains
const SUPPORTED_HEX_CHAINS = ['0x1', '0x38'];

export default abstract class SwapControllerAbstract
  implements IServiceController
{
  public readonly ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

  protected readonly origin: string;

  protected readonly swapsController: SwapsController;

  protected readonly getTransactionController: () => TransactionController;

  protected constructor(swapsController: SwapsController, origin: string) {
    this.swapsController = swapsController;
    this.getTransactionController = swapsController.getTxController;
    this.origin = origin;
  }

  protected generateId(): number {
    return Date.now() + Math.random();
  }

  protected generateDeadline(): number {
    return Math.floor(Date.now() / 1000) + 60 * 10;
  }

  protected get transactionController() {
    const controller = this.getTransactionController();
    if (!controller) {
      throw new Error('Transaction controller is not defined!');
    }
    return controller;
  }

  protected async getDeriveHdKey(): Promise<HDKey> {
    const hdKey = await this.swapsController.deriveHdKey();
    if (!hdKey) {
      throw new Error('HdKey not available');
    }
    return hdKey;
  }

  protected async getPrivateKey(): Promise<string> {
    const hdKey = await this.getDeriveHdKey();
    if (!hdKey.privateKey) {
      throw new Error('HdKey privateKey is not available');
    }
    return Buffer.from(hdKey.privateKey).toString('hex');
  }

  protected getRpcByChainId(
    chainId: ValueOf<typeof CHAIN_IDS> | string,
  ): string {
    const rpc = CHAIN_ID_TO_RPC_URL_MAP[chainId] as undefined | string;
    if (!rpc) {
      throw new Error(`No rpc url for current chainId:${chainId}`);
    }
    return rpc;
  }

  protected getWeb3Instance(chainId: string): Web3 {
    return new Web3(
      new Web3.providers.HttpProvider(this.getRpcByChainId(chainId as string)),
    );
  }

  protected async getWeb3Signer(web3: Web3) {
    if (!web3) {
      throw new Error('No web3 instance!');
    }
    const privateKey = await this.getPrivateKey();
    const signer = web3.eth.accounts.privateKeyToAccount(
      Buffer.from(privateKey, 'hex'),
    );
    web3.eth.accounts.wallet.add(signer);
    return signer;
  }

  protected encodePath(path: string[], fees: number[]) {
    if (path.length !== fees.length + 1) {
      throw new Error('path/fee lengths do not match');
    }
    let encoded = '0x';
    for (let i = 0; i < fees.length; i++) {
      encoded += String(path[i]).slice(2);
      encoded += Web3.utils.toHex(Number(fees[i])).slice(2).padStart(6, '0');
    }
    encoded += path[path.length - 1].slice(2);
    return encoded.toLowerCase();
  }

  protected getWrappedByChainId(chainId: string): string {
    // TODO: refactor next code. Get wrapper addresses from constants
    switch (chainId) {
      case '0x1':
        return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
      case '0x38':
        return '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
      default:
        throw new Error('Unexpected error!');
    }
  }

  protected decimalUnits() {
    return Object.entries(web3Utils.ethUnitMap).reduce((acc, [k, v]) => {
      const unitKey = Number(v).toString().length - 1;
      return { ...acc, [unitKey]: k };
    }, {} as Record<number, string>);
  }

  protected toWei(humanAmount: string | number, decimals: number) {
    return Math.round(Number(humanAmount) * 10 ** decimals).toString();
    try {
      const unit = this.decimalUnits[decimals];
      return web3.utils.toWei(Number(humanAmount), unit);
    } catch (_) {
      return Math.round(Number(humanAmount) * 10 ** decimals).toString();
    }
  }

  protected fromWei(humanAmount: string | number, decimals: number) {
    return Number(humanAmount) / 10 ** decimals;
    try {
      const unit = this.decimalUnits[decimals];
      return web3.utils.fromWei(Number(humanAmount), unit);
    } catch (_) {
      return Number(humanAmount) / 10 ** decimals;
    }
  }

  protected async formatToken(
    token: IExchangerCoin,
    options: { nativeZero?: boolean } = {},
  ): Promise<{
    wallet: string;
    address: string;
    account: string;
    chainId: string;
    decimals: number;
    toWei: (humanAmount: number | string) => string;
    fromWei: (humanAmount: number | string) => string;
    isToken: boolean;
    isNative: boolean;
    isWrapper: boolean;
  }> {
    const { nativeZero = false } = options;
    if (!token || !this.isSupportedChain(token.chainId)) {
      throw new Error(`Token not supported!`);
    }
    if (token.network === NetworkNames.fiat) {
      throw new Error(`Network ${NetworkNames.fiat} not supported!`);
    }
    const w3 = this.getWeb3Instance(token.chainId);
    const signer = await this.getWeb3Signer(w3);
    const { chainId, contract, decimals = 18 } = token;
    const isNative = !contract;
    const isToken = Boolean(contract);
    const isWrapper =
      contract && contract === this.getWrappedByChainId(chainId);

    const address =
      contract ||
      (isNative && nativeZero
        ? this.ADDRESS_ZERO
        : this.getWrappedByChainId(chainId));

    return {
      account: signer.address,
      wallet: signer.address,
      // address: contract ?? nativeZero ? this.ADDRESS_ZERO : this.getWrappedByChainId(chainId),
      address,
      decimals,
      chainId,
      isToken,
      isNative,
      isWrapper,
      toWei(humanAmount) {
        return Math.round(Number(humanAmount) * 10 ** decimals).toString();
        try {
          const unit = this.decimalUnits[this.decimals];
          return web3.utils.toWei(Number(humanAmount), unit);
        } catch (_) {
          return Math.round(Number(humanAmount) * 10 ** decimals).toString();
        }
      },
      fromWei(humanAmount) {
        return Number(humanAmount) / 10 ** decimals;
        try {
          const unit = this.decimalUnits[this.decimals];
          return web3.utils.fromWei(Number(humanAmount), unit);
        } catch (_) {
          return Number(humanAmount) / 10 ** decimals;
        }
      },
    };
  }

  protected isSupportedChain(
    chainId: string,
    chains = SUPPORTED_HEX_CHAINS,
  ): boolean {
    return chains.includes(chainId.toString());
  }

  protected checkSupportPair(pair: {
    from: IExchangerCoin;
    to: IExchangerCoin;
  }): boolean {
    const { from, to } = pair;
    if (!from) {
      throw new Error('Empty from token!');
    }
    if (!to) {
      throw new Error('Empty to token!');
    }
    const isDifferentChains = from.chainId !== to.chainId;
    const isSameContract = from.contract === to.contract;
    const isNotSupported =
      isDifferentChains ||
      isSameContract ||
      !this.isSupportedChain(from.chainId);
    if (isNotSupported) {
      throw new Error('Such pair is not supported!');
    }
    return true;
  }

  protected weiToHex(value: string): string {
    return `0x${decimalToHex(Number(value))}`;
  }

  protected amountToDec(amount: string | number, decimals = 18): string {
    return Math.ceil(Number(amount) * 10 ** decimals).toString();
  }

  protected amountToHex(amount: string | number, decimals = 18): string {
    const value = this.amountToDec(amount, decimals);
    return `0x${decimalToHex(value)}`;
  }

  protected decodeData(params: {
    address: string;
    abi: AbiInput[];
    bytes: HexString;
    method: string;
  }) {
    //
    // this.decodeData({
    //   abi: SMART_ROUTER_V3_ABI,
    //   address: SMART_ROUTER_V3_CONTRACT,
    //   bytes: tstData_1,
    //   method: 'exactInputSingle',
    // });
    // this.decodeData({
    //   abi: SMART_ROUTER_V3_ABI,
    //   address: SMART_ROUTER_V3_CONTRACT,
    //   bytes: tstData_2,
    //   method: 'unwrapWETH9',
    // });
    //
    const { abi, address, bytes, method } = params;
    const msgStart = `|==================== [START] Decode Data -${method}- ====================|`;
    const msgEnd = `|==================== [END] Decode Data   -${method}- ====================|`;
    console.log(msgStart);
    try {
      console.log('decodeData => abi', abi);
      console.log('decodeData => bytes', bytes);
      console.log('decodeData => method', method);
      const functionAbi = abi.find(
        (item) => item.name === method && item.type === 'function',
      );
      const web3 = new Web3();
      const contract = new web3.eth.Contract(abi, address);
      const decodedData = web3.eth.abi.decodeParameters(
        functionAbi.inputs,
        bytes.slice(10),
      );
      console.log('decodeData => contract', contract);
      console.log('decodeData => decodedData', decodedData);
      console.log(msgEnd);
      return decodedData;
    } catch (err) {
      console.error('Decoder data: ', err);
    }
    console.log(msgEnd);
  }

  protected normalizeRates(data: {
    amountIn?: string;
    amountOut?: string;
    error?: string;
    rate?: string;
    hasApproval?: boolean;
    approvedAllowance?: string;
  }): INormalizeRates {
    const defaultData = {
      fromAmount: null,
      toAmount: null,
      rate: null,
      minAmount: null,
      error: '',
      message: '',
      hasApproval: false,
      approvedAllowance: 0,
    };
    const { error, amountIn, amountOut, rate, hasApproval } = data;

    if (!error && !amountIn && !amountOut) {
      return defaultData;
    }

    if (error) {
      return { ...defaultData, error };
    }

    return {
      ...defaultData,
      hasApproval,
      fromAmount: amountIn,
      toAmount: amountOut,
      rate:
        rate || (Number(1 / Number(amountIn)) * Number(amountOut)).toString(),
    };
  }

  protected async getTokenAllowance({
    chainId,
    contract: contractAddress,
    spender,
    abi,
  }: {
    chainId: string;
    contract: string;
    spender: string;
    abi?: ContractAbi;
  }): Promise<BigInt> {
    const web3 = this.getWeb3Instance(chainId);
    const signer = await this.getWeb3Signer(web3);
    const tokenContractInstance = new web3.eth.Contract(
      abi || ERC20_ABI,
      contractAddress,
    );
    const tokenContractAllowance = (
      tokenContractInstance.methods as any
    ).allowance(signer.address, spender);

    return await tokenContractAllowance.call();
  }

  protected async getApproveTokenData(params: {
    chainId: string;
    contract: string;
    spender: string;
    amount?: string;
    abi?: ContractAbi;
  }) {
    const { chainId, contract: contractAddress, spender, abi, amount } = params;
    const contractAbi = abi ?? ERC20_ABI;
    const MAX_AMOUNT_IN_HEX = `115792089237316195423570985008687907853269984665640564039457584007913129639935`;
    const approveAmount = amount ?? MAX_AMOUNT_IN_HEX;

    const web3 = this.getWeb3Instance(chainId);
    const signer = await this.getWeb3Signer(web3);

    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    const approval = (contract.methods as any).approve(spender, approveAmount);

    const gas = await approval.estimateGas({
      from: signer.address,
    });
    const data = await approval.encodeABI();

    return {
      data,
      from: signer.address,
      to: contractAddress,
      localId: chainId,
      value: '0x0',
      gas: this.amountToHex(Number(gas).toString(), 0),
    };
  }

  protected async approveToken(params: {
    chainId: string;
    contract: string;
    spender: string;
    amount?: string;
    abi?: ContractAbi;
  }) {
    const txParams = await this.getApproveTokenData(params);

    return await this.createUnapprovedTransaction(txParams);
  }

  protected async checkAndApproveToken({
    chainId,
    contract,
    spender,
    abi,
    amount,
  }: {
    chainId: string;
    contract: string;
    spender: string;
    amount?: string;
    abi?: ContractAbi;
  }) {
    const isTokenFromApproval = await this.getTokenAllowance({
      chainId,
      spender,
      contract,
      abi,
    });

    if (isTokenFromApproval) {
      return;
    }

    this.approveToken({
      chainId,
      spender,
      contract,
      abi,
      amount,
    });
  }

  protected async createUnapprovedTransaction(
    rowTransaction: {
      data: string;
      from: string;
      to: string;
      localId: string;
      value: string;
      gas?: string;
      gasPrice?: string;
      nonce?: string;
    },
    options: {
      type?: TransactionType;
      id?: number;
      origin?: string;
      method?: string;
    } = {},
  ): Promise<unknown> {
    const txOptions = {
      method: 'eth_sendTransaction',
      origin: this.origin,
      id: this.generateId(),
      ...options,
    };
    return await this.transactionController.newUnapprovedTransaction(
      rowTransaction,
      txOptions,
    );
  }

  // service interface implements
  public getById(id: string): Promise<unknown> {
    throw new Error(`Method getById(id: ${id}) not implemented!`);
  }

  public abstract getRates(
    params: ISwapExchangerParams,
    options?: unknown,
  ): Promise<unknown>;

  /**
   * @param params
   * @deprecated
   */
  public swapStart(params: ISwapExchangerParams): Promise<unknown> {
    throw new Error(
      'Implement new exchanger swap interface! approveAllowance | getApprovedAllowance | swap',
    );
  }

  public abstract getApprovedAllowance(
    params: ISwapExchangerParams,
  ): Promise<IGetApprovedAllowanceResult>;

  public abstract approveAllowance(
    params: ISwapExchangerParams,
  ): Promise<unknown>;

  public abstract swap(params: ISwapExchangerParams): Promise<unknown>;
}
