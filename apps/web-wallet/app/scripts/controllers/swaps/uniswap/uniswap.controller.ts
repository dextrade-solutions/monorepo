import {
  CommandType,
  PERMIT2_ADDRESS,
  RoutePlanner,
  UNIVERSAL_ROUTER_ADDRESS,
} from '@uniswap/universal-router-sdk';
import { ethUnitMap } from 'web3-utils/src/converters';
import { ExchangerType } from '../../../../../shared/constants/exchanger';
import { TransactionType } from '../../../../../shared/constants/transaction';
import SwapControllerAbstract from '../SwapControllerAbstract';
import SwapsController from '../swaps';
import {
  IGetApprovedAllowanceResult,
  INormalizeRates,
  ISwapExchangerParams,
} from '../types';
import {
  UNISWAP_QUOTER_ABI,
  UNISWAP_QUOTER_CONTRACT,
  UNISWAP_UNIVERSAL_ROUTER_ABI,
} from './uniswap.router';

export default class UniswapController extends SwapControllerAbstract {
  constructor(swapsController: SwapsController) {
    super(swapsController, 'uniswap');
  }

  private async getQuote(params: ISwapExchangerParams): Promise<string> {
    const { from, to, amount = 1 } = params;
    const tokenFrom = await this.formatToken(from);
    const tokenTo = await this.formatToken(to);

    const QuoutersV3 = ['0x1'];
    const isV3Contract = QuoutersV3.includes(tokenFrom.chainId);

    const web3 = this.getWeb3Instance(tokenFrom.chainId);
    const quoterContract = new web3.eth.Contract(
      UNISWAP_QUOTER_ABI[tokenFrom.chainId],
      UNISWAP_QUOTER_CONTRACT[tokenFrom.chainId],
    );

    const quoterBytesPath = this.encodePath(
      [tokenFrom.address, tokenTo.address],
      [500],
    );

    const amountIn = this.amountToDec(amount, tokenFrom.decimals);
    const amountOutRes = await (quoterContract.methods as any)
      .quoteExactInput(quoterBytesPath, amountIn)
      .call();
    const amountOut = isV3Contract ? amountOutRes : amountOutRes[0];
    return Number(amountOut).toString();
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

    const allowanceValue = await this.getTokenAllowance({
      contract: tokenFrom.address,
      chainId: tokenFrom.chainId,
      spender: PERMIT2_ADDRESS,
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
      spender: PERMIT2_ADDRESS,
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
        throw new Error('Invalid amo«unt');
      }
      const tokenFrom = await this.formatToken(from);
      const tokenTo = await this.formatToken(to);

      const TX_PATH_FEE = 500;
      const amountIn = this.amountToHex(amount, tokenFrom.decimals);
      const amountOutRes = await this.getQuote(params);
      const amountOut = this.weiToHex(
        Math.ceil(Number(amountOutRes) * 0.9).toString(),
      );
      const swapPathEncoded = this.encodePath(
        [tokenFrom.address, tokenTo.address],
        [TX_PATH_FEE],
      );

      const planner = new RoutePlanner();

      if (tokenFrom.isNative) {
        // WRAP NATIVE TO TOKEN WRAPPER
        planner.addCommand(CommandType.WRAP_ETH, [
          '0x0000000000000000000000000000000000000002',
          amountIn,
        ]);
      }

      // V3_SWAP_EXACT_IN
      planner.addCommand(CommandType.V3_SWAP_EXACT_IN, [
        // '0x0000000000000000000000000000000000000001',
        tokenFrom.isNative || tokenFrom.isWrapper
          ? '0x0000000000000000000000000000000000000001'
          : '0x0000000000000000000000000000000000000002',
        amountIn,
        amountOut,
        swapPathEncoded,
        tokenFrom.isToken, // // if FROM ERC20 - true/ from NATIVE - false
      ]);

      // UNWRAP WRAPPER TO NATIVE
      planner.addCommand(CommandType.UNWRAP_WETH, [
        '0x0000000000000000000000000000000000000001',
        tokenTo.isNative
          ? amountOut
          : '0x0000000000000000000000000000000000000000',
      ]);

      const web3 = await this.getWeb3Instance(from.chainId);
      const signer = await this.getWeb3Signer(web3);

      const abi = UNISWAP_UNIVERSAL_ROUTER_ABI;
      const contract = UNIVERSAL_ROUTER_ADDRESS(Number(from.chainId));

      const routerSmartContract = new web3.eth.Contract(abi, contract);

      const txParams = await (routerSmartContract.methods as any).execute(
        planner.commands,
        planner.inputs,
        this.generateDeadline(),
      );

      const encodeTxParams = txParams.encodeABI();
      console.log('encodeTxParams', encodeTxParams);

      const data = web3.eth.abi.encodeFunctionCall(
        {
          inputs: [
            { internalType: 'bytes', name: 'commands', type: 'bytes' },
            { internalType: 'bytes[]', name: 'inputs', type: 'bytes[]' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          ],
          name: 'execute',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
        [planner.commands, planner.inputs, this.generateDeadline()],
      );

      const rowTransaction = {
        from: signer.address,
        to: contract,
        data,
        value: tokenFrom.isToken ? '0x0' : amountIn,
        localId: from.localId,
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
