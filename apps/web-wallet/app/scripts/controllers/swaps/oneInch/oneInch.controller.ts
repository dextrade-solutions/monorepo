import { ContractAbi } from 'web3';
import { ExchangerType } from '../../../../../shared/constants/exchanger';
import { TransactionType } from '../../../../../shared/constants/transaction';
import OneInchService from '../../../services/oneInch-service';
import SwapControllerAbstract from '../SwapControllerAbstract';
import SwapsController from '../swaps';
import {
  IGetApprovedAllowanceResult,
  INormalizeRates,
  ISwapExchangerParams,
} from '../types';
import {
  ONE_INCH_QUOTER_ABI,
  ONE_INCH_QUOTER_CONTRACT,
} from './oneInch.router';

export default class OneInchController extends SwapControllerAbstract {
  private readonly service: OneInchService = new OneInchService();

  constructor(swapsController: SwapsController) {
    super(swapsController, '1Inch');
  }

  protected getWrappedByChainId(chainId: string): string {
    const CHAIN_SUPPORTS = ['0x1', '0x38'];
    if (!CHAIN_SUPPORTS.includes(chainId)) {
      throw new Error(`Unsupported wrapper for chainId: ${chainId}!`);
    }
    return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  }

  private async getQuote(params: ISwapExchangerParams): Promise<string> {
    const { from, to, amount = 1 } = params;

    const tokenFrom = await this.formatToken(from);
    const tokenTo = await this.formatToken(to);
    const amountIn = tokenFrom.toWei(amount);

    try {
      const data: { toAmount?: string } = await this.service.getQuote(
        tokenFrom.chainId,
        {
          src: tokenFrom.address,
          dst: tokenTo.address,
          amount: amountIn,
        },
      );
      if (!data || !data.toAmount) {
        throw new Error('Unexpected get amountOut error');
      }
      return data.toAmount;
    } catch (err) {
      console.error(err.message);
      return '0';
      const web3 = this.getWeb3Instance(tokenFrom.chainId);
      const quoterContract = new web3.eth.Contract(
        ONE_INCH_QUOTER_ABI[tokenFrom.chainId],
        ONE_INCH_QUOTER_CONTRACT[tokenFrom.chainId],
      );

      const amountOutRes = await (quoterContract.methods as any)
        .getRate(
          tokenFrom.address,
          tokenTo.address,
          tokenFrom.isToken || tokenTo.isToken,
        )
        .call();
      return Number(amountOutRes).toString();
    }
  }

  public async getRates(
    params: ISwapExchangerParams,
    options = {},
  ): Promise<INormalizeRates> {
    const { checkApproval = false } = options;
    const { from, to, amount = 1 } = params;
    try {
      this.checkSupportPair({ from, to });
      const tokenTo = await this.formatToken(to);
      const amountOutRes = await this.getQuote(params);
      const amountOut = tokenTo.fromWei(amountOutRes);
      let hasApproval = true;
      let approvedAllowance = '0';
      if (checkApproval) {
        const allowanceData = await this.getApprovedAllowance(params);
        hasApproval = allowanceData?.hasApproval;
        approvedAllowance = allowanceData?.approved?.toString();
      }

      return this.normalizeRates({
        amountIn: amount.toString(),
        amountOut,
        hasApproval,
        approvedAllowance,
      });
    } catch (err) {
      console.error(`${this.origin} quote`, err.message);
      return this.normalizeRates({ error: err.message });
    }
  }

  public async getApprovedAllowance(
    params: ISwapExchangerParams,
  ): Promise<IGetApprovedAllowanceResult> {
    const { from, amount = 1 } = params;
    const tokenFrom = await this.formatToken(from);
    const amountWei = tokenFrom.toWei(amount);
    const web3 = this.getWeb3Instance(tokenFrom.chainId);
    const signer = await this.getWeb3Signer(web3);
    const allowanceData = await this.service.getAllowance(tokenFrom.chainId, {
      tokenAddress: tokenFrom.address,
      walletAddress: signer.address,
    });
    const allowanceValue = allowanceData?.allowance || 0;
    return {
      hasApproval: BigInt(allowanceValue) >= BigInt(amountWei),
      approved: allowanceValue,
    };
  }

  public async approveAllowance(
    params: ISwapExchangerParams,
  ): Promise<unknown> {
    const { from, approvalValue } = params;
    const tokenFrom = await this.formatToken(from);
    const amountApproval = approvalValue
      ? tokenFrom.toWei(Number(approvalValue))
      : null;

    const { chainId, address: contract } = tokenFrom;
    const { localId } = from;
    const web3 = this.getWeb3Instance(chainId);
    const signer = await this.getWeb3Signer(web3);

    const approveParams = {
      tokenAddress: contract,
    };
    if (amountApproval) {
      approveParams.amount = amountApproval;
    }
    const data = await this.service.approveTransaction(chainId, approveParams);
    const gasPrice = this.amountToHex(Number(data.gasPrice).toString(), 0);
    const value = this.amountToHex(Number(data.value).toString(), 0);
    const rowTransaction = {
      ...data,
      gasPrice,
      value,
      nonce: (await web3.eth.getTransactionCount(signer.address)).toString(),
      from: signer.address,
      localId,
    };

    return await new Promise((resolve, reject) => {
      this.createUnapprovedTransaction(rowTransaction, {
        type: TransactionType.swapApproval,
        id: this.generateId(),
        initialCallback: (txMeta) => {
          resolve(txMeta);
        },
        optionalTxMeta: {
          swapMetaData: {},
        },
      }).catch((err) => reject(err));
    });
  }

  public async swap(params: ISwapExchangerParams): Promise<unknown> {
    const { from, to, amount } = params;
    try {
      this.checkSupportPair({ from, to });
      if (!amount) {
        throw new Error('Invalid amount');
      }
      const tokenFrom = await this.formatToken(from);
      const tokenTo = await this.formatToken(to);

      const amountIn = tokenFrom.toWei(amount);
      const data = await this.service.swap(tokenFrom.chainId, {
        src: tokenFrom.address,
        dst: tokenTo.address,
        amount: amountIn,
        from: tokenFrom.account,
        slippage: '5',
      });

      if (!data || !data.tx) {
        throw new Error('Unexpected exception!');
      }

      const {
        toAmount = '0',
        tx: { gas, gasPrice, value, ...tx },
      } = data;

      const web3 = this.getWeb3Instance(from.chainId);
      const signer = await this.getWeb3Signer(web3);
      const nonce = await web3.eth.getTransactionCount(signer.address);
      const rowTransaction = {
        // ...data.tx,
        ...tx,
        localId: tokenFrom.chainId,
        // gas: this.amountToHex(Number(gas).toString(), 0),
        // gasPrice: this.amountToHex(Number(gasPrice).toString(), 0),
        value: this.amountToHex(Number(value).toString(), 0),
        nonce: Number(nonce) + 1,
      };

      const fromAsset = this.transactionController.getAssetModelBackground(
        from.localId,
      );
      const toAsset = this.transactionController.getAssetModelBackground(
        to.localId,
      );
      return await new Promise((resolve, reject) => {
        this.createUnapprovedTransaction(rowTransaction, {
          type: TransactionType.swap,
          id: this.generateId(),
          initialCallback: (txMeta) => {
            resolve(txMeta);
          },
          optionalTxMeta: {
            exchangerType: ExchangerType.DEX,
            type: TransactionType.swap,
            source: fromAsset.localId,
            destination: toAsset.localId,
            swapMetaData: {
              token_from: fromAsset.symbol,
              token_from_amount: amount,
              token_to: toAsset.symbol,
              token_to_amount: tokenTo.fromWei(toAmount),
              is_hardware_wallet: false,
            },
          },
        }).catch((err) => reject(err));
      });
    } catch (err) {
      console.error(err);
      throw new Error(`Swap [${this.origin}]: ${err.message}`);
    }
  }
}
