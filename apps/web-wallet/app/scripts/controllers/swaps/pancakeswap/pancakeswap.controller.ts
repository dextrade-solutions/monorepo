import { ExchangerType } from '../../../../../shared/constants/exchanger';
import { CHAIN_IDS } from '../../../../../shared/constants/network';
import { TransactionType } from '../../../../../shared/constants/transaction';
import SwapControllerAbstract from '../SwapControllerAbstract';
import SwapsController from '../swaps';
import {
  IGetApprovedAllowanceResult,
  INormalizeRates,
  ISwapExchangerParams,
} from '../types';
import {
  MULTICALL_V3_CONTRACT,
  ROUTER_V2_CONTRACT,
  SMART_ROUTER_V3_CONTRACT,
} from './pancakeswap.router';
import {
  MULTICALL_V3_ABI,
  ROUTER_V2_ABI,
  SMART_ROUTER_V3_ABI,
} from './pancakeswap.abi';

export default class PancakeswapController extends SwapControllerAbstract {
  constructor(swapsController: SwapsController) {
    super(swapsController, 'pancakeswap.finance');
  }

  private async getQuote(params: ISwapExchangerParams): Promise<string> {
    const { from, to, amount = 1 } = params;
    const tokenFrom = await this.formatToken(from);
    const tokenTo = await this.formatToken(to);

    const web3 = this.getWeb3Instance(tokenFrom.chainId);
    const quoterContract = new web3.eth.Contract(
      ROUTER_V2_ABI,
      ROUTER_V2_CONTRACT[tokenFrom.chainId],
    );

    const amountIn = tokenFrom.toWei(amount);
    const amountOutRes = await (quoterContract.methods as any)
      .getAmountsOut(amountIn, [tokenFrom.address, tokenTo.address])
      .call();
    return Number(amountOutRes[1]).toString();
  }

  public async getRates(
    params: ISwapExchangerParams,
    options = {},
  ): Promise<INormalizeRates> {
    const { from, to, amount = 1 } = params;
    const { checkApproval = false } = options;
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
    const { from, amount } = params;
    const tokenFrom = await this.formatToken(from);
    const amountWei = tokenFrom.toWei(amount);
    if (tokenFrom.isNative) {
      return {
        hasApproval: true,
        approved: Number(amountWei || 0),
      };
    }
    const allowanceValue = await this.getTokenAllowance({
      contract: tokenFrom.address,
      chainId: tokenFrom.chainId,
      spender: SMART_ROUTER_V3_CONTRACT[tokenFrom.chainId],
    });
    return {
      hasApproval: BigInt(Number(allowanceValue)) >= BigInt(amountWei),
      approved: Number(allowanceValue || 0),
    };
  }

  public async approveAllowance(
    params: ISwapExchangerParams,
  ): Promise<unknown> {
    const { from, approvalValue } = params;
    const tokenFrom = await this.formatToken(from);
    const amount = approvalValue
      ? tokenFrom.toWei(Number(approvalValue))
      : undefined;

    const rowTransaction = await this.getApproveTokenData({
      contract: tokenFrom.address,
      chainId: tokenFrom.chainId,
      spender: SMART_ROUTER_V3_CONTRACT[tokenFrom.chainId],
      amount,
    });
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

      const web3 = this.getWeb3Instance(tokenFrom.chainId);
      const signer = await this.getWeb3Signer(web3);

      const contract = new web3.eth.Contract(
        SMART_ROUTER_V3_ABI,
        SMART_ROUTER_V3_CONTRACT[tokenFrom.chainId],
      );
      const multicallContract = new web3.eth.Contract(
        MULTICALL_V3_ABI,
        MULTICALL_V3_CONTRACT,
      );

      const amountIn = this.amountToHex(amount, tokenFrom.decimals);
      const amountOutRes = await this.getQuote(params);
      const amountOut = this.weiToHex(amountOutRes);

      const callData: string[] = [];

      const exactInputSingleParams = {
        tokenIn: tokenFrom.address,
        tokenOut: tokenTo.address,
        fee: 100,
        recipient: tokenFrom.isNative
          ? tokenFrom.wallet
          : '0x0000000000000000000000000000000000000002',
        // amountIn,
        amountIn: this.amountToDec(amount, tokenFrom.decimals),
        // amountOutMinimum: amountOut,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      };

      const exactInputSingleData = (contract.methods as any)
        .exactInputSingle(exactInputSingleParams)
        .encodeABI();

      callData.push(exactInputSingleData);

      if (tokenTo.isNative) {
        const unwrapWETH9 = (contract.methods as any)
          .unwrapWETH9(amountOut, tokenTo.account)
          .encodeABI();
        callData.push(unwrapWETH9);
      }

      const multicall = (contract.methods as any).multicall(
        this.generateDeadline(),
        callData,
      );

      const multicallData = multicall.encodeABI();
      const gasPrice = await new Promise((resolve) => {
        web3.eth
          .getGasPrice()
          .then((gp) => resolve(web3.utils.toHex(gp)))
          .catch(() => resolve('0x0'));
      });

      const gas = await new Promise((resolve) => {
        return (
          web3.eth
            .estimateGas({ from: signer.address })
            // .then(r => resolve(web3.utils.toHex(r)))
            .then((r) => resolve(Number(r)))
            .catch((err) => {
              console.warn(
                `[${this.origin}] Error get estimateGas. ${err?.message}`,
              );
              resolve(0);
            })
        );
      });

      const rowTransaction = {
        data: multicallData,
        from: tokenFrom.account,
        to: SMART_ROUTER_V3_CONTRACT[tokenFrom.chainId],
        localId: from.localId,
        value: tokenFrom.isToken ? '0x0' : amountIn,
        // gasPrice,
        // gas,
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
              token_to_amount: tokenTo.fromWei(amountOutRes),
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
