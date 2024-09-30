import { ExchangerType } from '../../../../../shared/constants/exchanger';
import { TransactionType } from '../../../../../shared/constants/transaction';
import UnizenService from '../../../services/unizen-service';
import SwapControllerAbstract from '../SwapControllerAbstract';
import SwapsController from '../swaps';
import {
  IExchangerCoin,
  IGetApprovedAllowanceResult,
  INormalizeRates,
  ISwapExchangerParams,
} from '../types';
import { EBTCTradeType, EContractVersion, ISingleQuoteAPIData } from './types';
import { UNIZEN_CONTRACT_ADDRESS } from './unizen.router';

// TODO: find chains variables on project
const ETH_CHAIN_ID = '0x1';
const BSC_CHAIN_ID = '0x38';
const BTC_CHAIN_ID = 'bitcoin';

const EVN_CHAINS = [ETH_CHAIN_ID, BSC_CHAIN_ID];
const NO_EVN_CHAINS = [BTC_CHAIN_ID];

const BTC_UNIZEN_CHAIN_ID = -3980891822;

export default class UnizenController extends SwapControllerAbstract {
  private readonly service: UnizenService = new UnizenService();

  private quotesSingle: ISingleQuoteAPIData[] = [];

  private quotesCross: unknown[] = [];

  constructor(swapsController: SwapsController) {
    super(swapsController, 'unizen');
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

    const supportedChains = [...NO_EVN_CHAINS, ...EVN_CHAINS];
    const isSupportedFrom = this.isSupportedChain(
      from.chainId,
      supportedChains,
    );
    const isSupportedTo = this.isSupportedChain(to.chainId, supportedChains);

    if (!isSupportedFrom) {
      throw new Error(`${from.chainId} chain is not supported!`);
    }

    if (!isSupportedTo) {
      throw new Error(`${to.chainId} chain is not supported!`);
    }

    if ([from.chainId, to.chainId].includes(BTC_CHAIN_ID)) {
      const supportedBTCSwapChains = [BTC_CHAIN_ID, ETH_CHAIN_ID];
      const isSupported = [from.chainId, to.chainId].find((chain) =>
        supportedBTCSwapChains.includes(chain),
      );
      if (!isSupported) {
        throw new Error('Unsupported BTC swap chains!');
      }

      const isNativeFrom = from.isNativeToken || !from.contract;
      const isNativeTo = to.isNativeToken || !to.contract;
      if (!isNativeFrom || !isNativeTo) {
        throw new Error('Exchange native tokens only');
      }
    }

    return true;
  }

  private async getQuote(
    params: ISwapExchangerParams,
  ): Promise<{ data: ISingleQuoteAPIData[] | unknown; amountOut: string }> {
    const { from: fromToken, to: toToken, amount } = params;
    const from = this.transactionController.getAssetModelBackground(
      fromToken.localId,
    );
    const to = this.transactionController.getAssetModelBackground(
      toToken.localId,
    );

    const fromTokenAddress =
      from.isNativeToken || !from.contract ? this.ADDRESS_ZERO : from.contract;
    const toTokenAddress =
      to.isNativeToken || !to.contract ? this.ADDRESS_ZERO : to.contract;
    const accountFrom = from.account || from.getAccount();
    const accountTo = to.account || to.getAccount();
    const amountIn = this.toWei(amount, from.decimals || 0);
    const isSingleChains = from.chainId === to.chainId;

    const handleSingleQuote = async () => {
      const data = await this.service.singleQuote({
        chainId: Number(from.chainId).toString(),
        fromTokenAddress,
        toTokenAddress,
        amount: amountIn,
      });
      if (!data || !data.length) {
        throw new Error('Unexpected get single quotes error');
      }
      this.quotesSingle = data;
      return { data, amountOut: data[0]?.toTokenAmount };
    };

    const handleCrossQuoteEVM = async () => {
      const data = await this.service.crossQuote({
        sourceChainId: Number(from.chainId).toString(),
        destinationChainId: Number(to.chainId).toString(),
        fromTokenAddress,
        toTokenAddress,
        amount: amountIn,
        sender: accountFrom,
      });
      if (!data || !data.length) {
        throw new Error('Unexpected get cross quotes error');
      }
      this.quotesCross = data;
      return { data, amountOut: data[0]?.dstTrade?.toTokenAmount };
    };

    const handleCrossQuoteBTC = async () => {
      const supportedBTCQuotesChains = ['bitcoin', '0x1'];
      const isNativeFrom = from.isNativeToken || !from.contract;
      const isNativeTo = to.isNativeToken || !to.contract;
      const supportedFrom = supportedBTCQuotesChains.includes(from.chainId);
      const supportedTo = supportedBTCQuotesChains.includes(to.chainId);
      if (!isNativeFrom || !isNativeTo) {
        throw new Error('Exchange native tokens only');
      }
      if (!supportedFrom || !supportedTo) {
        throw new Error('Unsupported BTC swap chains!');
      }
      const getChainIdFromToken = (t: IExchangerCoin) =>
        t.chainId === 'bitcoin' ? BTC_UNIZEN_CHAIN_ID : Number(t.chainId);
      const crossQuoteParams = {
        fromTokenAddress, // : this.ADDRESS_ZERO,
        toTokenAddress, // : this.ADDRESS_ZERO,
        sourceChainId: getChainIdFromToken(from).toString(),
        destinationChainId: getChainIdFromToken(to).toString(),
        amount: amountIn,
        sender: accountFrom,
        receiver: accountTo,
      };
      const data = await this.service.crossQuote(crossQuoteParams);
      if (!data || !data.length) {
        throw new Error('Unexpected get cross quotes error');
      }
      this.quotesCross = data;
      return { data, amountOut: data[0]?.dstTrade?.toTokenAmount };
    };

    try {
      if (isSingleChains) {
        return await handleSingleQuote();
      }
      if ([from.chainId, to.chainId].includes('bitcoin')) {
        return await handleCrossQuoteBTC();
      }
      return await handleCrossQuoteEVM();
    } catch (err) {
      const error = err as Error;
      console.error(error.message);
      throw error;
      // return [];
    }
  }

  private async getSingleQuotes(params: ISwapExchangerParams) {
    if (this.quotesSingle.length) {
      return this.quotesSingle;
    }
    const quotes = await this.getQuote(params);
    if (!quotes || !quotes.data) {
      throw new Error('Unexpected single quotes exception!');
    }
    return quotes.data;
  }

  private async getCrossQuotes(params: ISwapExchangerParams) {
    if (this.quotesCross.length) {
      return this.quotesCross;
    }
    const quotes = await this.getQuote(params);
    if (!quotes || !quotes.data) {
      throw new Error('Unexpected cross quotes exception!');
    }
    return quotes.data;
  }

  public async getRates(
    params: ISwapExchangerParams,
    options: { checkApproval?: boolean } = {},
  ): Promise<INormalizeRates> {
    const { checkApproval = false } = options;
    const { from, to, amount = 1 } = params;
    if (from.localId === to.localId) {
      throw new Error('Unexpected support tokens exception!');
    }
    try {
      this.checkSupportPair({ from, to });
      const quotes = await this.getQuote(params);
      const amountOut = this.fromWei(quotes.amountOut, to.decimals || 18);
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
      const error = err?.error?.description || err.message;
      console.error(`${this.origin} quote`, error);
      return this.normalizeRates({ error });
    }
  }

  public async getApprovedAllowance(
    params: ISwapExchangerParams,
  ): Promise<IGetApprovedAllowanceResult> {
    const { from: fromToken, to: toToken, amount } = params;
    const from = this.transactionController.getAssetModelBackground(
      fromToken.localId,
    );
    const to = this.transactionController.getAssetModelBackground(
      toToken.localId,
    );
    const amountWei = this.toWei(amount, from.decimals || 0);
    if (from.isNativeToken || from.chainId === BTC_CHAIN_ID) {
      return {
        hasApproval: true,
        approved: Number(amountWei || 0),
      };
    }

    const web3 = this.getWeb3Instance(from.chainId);
    const signer = await this.getWeb3Signer(web3);
    const isSingleChains = from.chainId === to.chainId;
    const quotes = isSingleChains
      ? await this.getSingleQuotes(params)
      : await this.getCrossQuotes(params);
    const selectedQuote = quotes[0];
    if (!selectedQuote) {
      throw new Error('Unexpected getApprovedAllowance quotes exception');
    }
    const chainId =
      from.chainId === BTC_CHAIN_ID
        ? BTC_UNIZEN_CHAIN_ID
        : Number(from.chainId);
    const allowanceData = await this.service.approvalAllowance({
      tokenAddress: from.contract,
      walletAddress: signer.address,
      contractVersion: selectedQuote.contractVersion,
      chainId: chainId.toString(),
    });
    if (!allowanceData) {
      throw new Error('Unexpected service approval allowance exception');
    }
    const allowanceValue = allowanceData?.allowance || 0;
    return {
      hasApproval: BigInt(allowanceValue) >= BigInt(amountWei),
      approved: Number(allowanceValue),
    };
  }

  public async approveAllowance(
    params: ISwapExchangerParams,
  ): Promise<unknown> {
    const { from: fromToken, to: toToken, approvalValue } = params;
    const from = this.transactionController.getAssetModelBackground(
      fromToken.localId,
    );
    const to = this.transactionController.getAssetModelBackground(
      toToken.localId,
    );

    if (from.isNativeToken || from.chainId === BTC_CHAIN_ID) {
      return;
    }

    const amountApproval = approvalValue
      ? this.toWei(Number(approvalValue), from.decimals || 0)
      : null;

    const isSingleChains = from.chainId === to.chainId;
    const quotes = isSingleChains
      ? await this.getSingleQuotes(params)
      : await this.getCrossQuotes(params);
    const selectedQuote = quotes[0];
    if (!selectedQuote) {
      throw new Error('Unexpected getApprovedAllowance quotes exception');
    }

    const web3 = this.getWeb3Instance(from.chainId);
    const signer = await this.getWeb3Signer(web3);
    let approveParams = {
      tokenAddress: from.contract || from.account || from.getAccount(),
      walletAddress: signer.address,
      contractVersion: selectedQuote.contractVersion,
      chainId: Number(from.chainId).toString(),
    };
    if (amountApproval) {
      approveParams = Object.assign(approveParams, { amount: amountApproval });
    }

    const { gasPrice, ...data } = await this.service.approvalTransaction(
      approveParams,
    );

    const rowTransaction = {
      ...data,
      from: signer.address,
      localId: from.localId,
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

  private async swapSingle(params: ISwapExchangerParams): Promise<unknown> {
    const { from: fromToken, to: toToken, amount } = params;
    const from = this.transactionController.getAssetModelBackground(
      fromToken.localId,
    );
    const to = this.transactionController.getAssetModelBackground(
      toToken.localId,
    );

    const quotes: ISingleQuoteAPIData[] =
      this.quotesSingle || (await this.getQuote(params)).data;
    const selectedQuote = quotes[0];
    if (!selectedQuote) {
      throw new Error('No quote data');
    }

    const { chainId } = from;
    const web3 = this.getWeb3Instance(chainId);
    const signer = await this.getWeb3Signer(web3);

    const serviceSwapParams = {
      transactionData: selectedQuote?.transactionData,
      nativeValue: selectedQuote?.nativeValue,
      account: signer.address,
      tradeType: selectedQuote.tradeType,
    };

    const swapData = await this.service.singleSwap(chainId, serviceSwapParams);

    if (swapData.estimateGasError) {
      const errMessageDetails = swapData.estimateGasRawError?.details
        ?.replace('err: ', '')
        .replace(`address ${from.account || from.getAccount()}`, 'you')
        .split(' ')
        .map((str) => {
          if (Number.isNaN(Number(str))) {
            return str;
          }
          const humanValue = this.fromWei(str, from.decimals || 0);
          if (`${humanValue}`.includes('e')) {
            return str;
          }
          return `${humanValue} ${from.symbol}`;
        })
        .join(' ');
      const errMessage = swapData.estimateGasError.concat(
        ': ',
        errMessageDetails || '',
      );
      throw new Error(errMessage);
    }

    const routesByVersion =
      UNIZEN_CONTRACT_ADDRESS[swapData.contractVersion as EContractVersion];
    const contractAddress = routesByVersion[Number(chainId)];

    // const value = from.isNativeToken ? web3.utils.toHex(swapData.nativeValue) : '0x0';
    const value = from.isNativeToken
      ? this.amountToHex(swapData.nativeValue, 0)
      : '0x0';
    const rowTransaction = {
      localId: from.chainId,
      value,
      from: signer.address,
      to: contractAddress,
      data: swapData.data,
    };

    return await new Promise((resolve, reject) => {
      this.createUnapprovedTransaction(rowTransaction, {
        type: TransactionType.swap,
        id: this.generateId(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        initialCallback: (txMeta) => {
          resolve(txMeta);
        },
        optionalTxMeta: {
          exchangerType: ExchangerType.DEX,
          type: TransactionType.swap,
          source: from.localId,
          destination: to.localId,
          swapMetaData: {
            token_from: from.symbol,
            token_from_amount: amount,
            token_to: to.symbol,
            token_to_amount: this.fromWei(
              selectedQuote?.toTokenAmount as string,
              to.decimals,
            ),
            is_hardware_wallet: false,
          },
        },
      }).catch((err) => reject(err));
    });
  }

  private async swapCrossBTC(params: ISwapExchangerParams): Promise<unknown> {
    const { from: fromToken, to: toToken, amount } = params;
    const from = this.transactionController.getAssetModelBackground(
      fromToken.localId,
    );
    const to = this.transactionController.getAssetModelBackground(
      toToken.localId,
    );

    const inboundAddress = await this.service.inboundAddresses();
    const quotes = (await this.getQuote(params)).data;
    const selectedQuote = quotes[0];
    if (!selectedQuote) {
      throw new Error('No quote data');
    }

    const chainId =
      from.chainId === BTC_CHAIN_ID
        ? BTC_UNIZEN_CHAIN_ID
        : Number(from.chainId);
    const account =
      from.chainId === BTC_CHAIN_ID
        ? from.account || from.getAccount()
        : to.account || to.getAccount();
    const serviceSwapParams = {
      transactionData: selectedQuote?.transactionData,
      nativeValue: selectedQuote?.nativeValue,
      account,
    };
    const swapData = await this.service.crossSwap(chainId, serviceSwapParams);
    if (!swapData || !swapData.data) {
      throw new Error('Unexpected cross BTC swap data exception!');
    }

    const expiry = selectedQuote?.transactionData.expiry;
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    if (currentTimestamp > expiry) {
      throw new Error('Expired transaction');
    }

    const tradeType: EBTCTradeType = selectedQuote?.transactionData?.tradeType;
    if (!tradeType) {
      throw new Error('Unexpected BTC trade type exception!');
    }

    if (tradeType === EBTCTradeType.BTC_TO_NATIVE) {
      const btcInboundAddress = inboundAddress.find(
        (item: any) => item.chain === BTC_UNIZEN_CHAIN_ID,
      );

      if (
        swapData.data.params[0].recipient.toLowerCase() !==
        btcInboundAddress.address.toLowerCase()
      ) {
        throw new Error('Invalid inbound address, please fetch latest quote');
      }

      const { amount: nativeValue = 1, decimals: nativeValueDecimals = 8 } =
        swapData.data.params[0].amount || {};
      // value: this.amountToHex(nativeValue, nativeValueDecimals),
      const rowTransaction = {
        localId: from.chainId,
        from: from.account || from.getAccount(),
        to: swapData.data.params[0].recipient,
        value: this.amountToHex(nativeValue, 0),
      };

      return await new Promise((resolve, reject) => {
        this.createUnapprovedTransaction(rowTransaction, {
          type: TransactionType.swap,
          id: this.generateId(),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          initialCallback: (txMeta) => {
            resolve(txMeta);
          },
          optionalTxMeta: {
            exchangerType: ExchangerType.DEX,
            type: TransactionType.swap,
            source: from.localId,
            destination: to.localId,
            swapMetaData: {
              token_from: from.symbol,
              token_from_amount: amount,
              token_to: to.symbol,
              token_to_amount: this.fromWei(
                selectedQuote?.toTokenAmount as string,
                to.decimals,
              ),
              is_hardware_wallet: false,
            },
          },
        }).catch((err) => reject(err));
      });
    }

    if (tradeType === EBTCTradeType.NATIVE_TO_BTC) {
      const currentInboundAddress = inboundAddress.find(
        (item) => item.chain === Number(from.chainId),
      );

      if (
        swapData.to.toLowerCase() !==
        currentInboundAddress.address.toLowerCase()
      ) {
        throw new Error('Invalid inbound address, please fetch latest quote');
      }

      const value = from.isNativeToken
        ? this.amountToHex(swapData.nativeValue, 0)
        : '0x0';
      const rowTransaction = {
        localId: from.chainId,
        data: swapData.data,
        from: from.account || from.getAccount(),
        to: swapData.to,
        value,
      };

      return await new Promise((resolve, reject) => {
        this.createUnapprovedTransaction(rowTransaction, {
          type: TransactionType.swap,
          id: this.generateId(),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          initialCallback: (txMeta) => {
            resolve(txMeta);
          },
          optionalTxMeta: {
            exchangerType: ExchangerType.DEX,
            type: TransactionType.swap,
            source: from.localId,
            destination: to.localId,
            swapMetaData: {
              token_from: from.symbol,
              token_from_amount: amount,
              token_to: to.symbol,
              token_to_amount: this.fromWei(
                selectedQuote?.toTokenAmount as string,
                to.decimals,
              ),
              is_hardware_wallet: false,
            },
          },
        }).catch((err) => reject(err));
      });
    }
  }

  private async swapCross(params: ISwapExchangerParams): Promise<unknown> {
    const { from: fromToken, to: toToken, amount } = params;
    if ([fromToken.chainId, toToken.chainId].includes(BTC_CHAIN_ID)) {
      return this.swapCrossBTC(params);
    }

    const from = this.transactionController.getAssetModelBackground(
      fromToken.localId,
    );
    const to = this.transactionController.getAssetModelBackground(
      toToken.localId,
    );

    const quotes = this.quotesCross || (await this.getQuote(params));
    const selectedQuote = quotes[0];
    if (!selectedQuote) {
      throw new Error('No quote data');
    }

    const { chainId } = from;
    const web3 = this.getWeb3Instance(chainId);
    const signer = await this.getWeb3Signer(web3);

    const serviceSwapParams = {
      transactionData: selectedQuote?.transactionData,
      // srcQuoteTxData: selectedQuote?.srcTrade?.transactionData,
      // dstQuoteTxData: selectedQuote?.dstTrade?.transactionData,
      // tradeParams: selectedQuote?.tradeParams,
      // nativeFee: selectedQuote?.nativeFee,
      nativeValue: selectedQuote?.nativeValue,
      account: signer.address,
    };

    const swapData = await this.service.crossSwap(chainId, serviceSwapParams);

    if (swapData.estimateGasError) {
      // const errMessage =
      //   swapData.estimateGasRawError?.shortMessage ||
      //   swapData.estimateGasRawError?.details ||
      //   swapData.estimateGasError;
      const errMessageDetails = swapData.estimateGasRawError?.details
        ?.replace('err: ', '')
        .replace(`address ${from.account || from.getAccount()}`, 'you')
        .split(' ')
        .map((str) => {
          if (Number.isNaN(Number(str))) {
            return str;
          }
          const humanValue = this.fromWei(str, from.decimals || 0);
          if (`${humanValue}`.includes('e')) {
            return str;
          }
          return `${humanValue} ${from.symbol}`;
        })
        .join(' ');
      const errMessage = swapData.estimateGasError.concat(
        ': ',
        errMessageDetails || '',
      );
      throw new Error(errMessage);
    }

    const routesByVersion =
      UNIZEN_CONTRACT_ADDRESS[swapData.contractVersion as EContractVersion];
    const contractAddress = routesByVersion[Number(chainId)];

    // const value = from.isNativeToken ? swapData.nativeValue : '0x0';
    // const value = from.isNativeToken ? web3.utils.toHex(swapData.nativeValue) : '0x0';
    const value = from.isNativeToken
      ? this.amountToHex(swapData.nativeValue, 0)
      : '0x0';
    // gas: swapData.estimateGas,
    // gas: web3.utils.toHex(swapData.estimateGas || 0),
    const gas = this.amountToHex(swapData.estimateGas, 0);
    const rowTransaction = {
      localId: from.localId,
      value,
      from: signer.address,
      to: contractAddress,
      data: swapData.data,
      gas,
    };

    return await new Promise((resolve, reject) => {
      this.createUnapprovedTransaction(rowTransaction, {
        type: TransactionType.swap,
        id: this.generateId(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        initialCallback: (txMeta) => {
          resolve(txMeta);
        },
        optionalTxMeta: {
          exchangerType: ExchangerType.DEX,
          type: TransactionType.swap,
          source: from.localId,
          destination: to.localId,
          swapMetaData: {
            token_from: from.symbol,
            token_from_amount: amount,
            token_to: to.symbol,
            token_to_amount: this.fromWei(
              selectedQuote?.toTokenAmount as string,
              to.decimals,
            ),
            is_hardware_wallet: false,
          },
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
      const isSingleSwap = from.chainId === to.chainId;
      if (isSingleSwap) {
        return await this.swapSingle(params);
      }
      return await this.swapCross(params);
    } catch (error) {
      const err = error as Error;
      console.error(err);
      throw new Error(`Swap [${this.origin}]: ${err.message}`);
    }
  }
}
